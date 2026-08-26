const crypto  = require('crypto');
const mongoose = require('mongoose');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const emailService = require('../services/emailService');
const { orderConfirmationTemplate } = require('../utils/emailTemplates');
const pdfService = require('../services/pdfService');

// ─── Optional Stripe (only initialise if key is present) ─────────────────────
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeError = (msg, code = 500) => Object.assign(new Error(msg), { statusCode: code });

/**
 * Generates the JazzCash HMAC-SHA256 secure hash.
 *
 * Algorithm (from JazzCash docs):
 * 1. Collect all pp_* params that have a non-empty value.
 * 2. Sort them alphabetically by key.
 * 3. Prepend the IntegritySalt, separate everything with '&'.
 * 4. HMAC-SHA256 the string using IntegritySalt as the secret key.
 * 5. Uppercase hex result.
 */
const generateJazzCashHash = (params) => {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT || '';
  const sortedValues = Object.keys(params)
    .sort()
    .map((k) => params[k])
    .filter((v) => v !== '' && v !== null && v !== undefined);
  const hashStr = [salt, ...sortedValues].join('&');
  return crypto
    .createHmac('sha256', salt)
    .update(hashStr)
    .digest('hex')
    .toUpperCase();
};

/** Format date as YYYYMMDDHHmmss (required by JazzCash) */
const jcDate = (d = new Date()) =>
  d.toISOString().replace(/[-T:Z.]/g, '').slice(0, 14);

/** Add minutes to a Date and return a new Date */
const addMinutes = (d, mins) => new Date(d.getTime() + mins * 60_000);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
// Creates an order for any payment method.  Stock is reserved immediately.
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      cartItems: rawItems,
      shippingAddress,
      paymentMethod,
      couponCode,
    } = req.body;

    if (!rawItems?.length)     return next(makeError('Cart is empty', 400));
    if (!shippingAddress)      return next(makeError('Shipping address is required', 400));
    if (!['Card', 'JazzCash', 'COD'].includes(paymentMethod))
      return next(makeError('Invalid payment method', 400));

    // ── 1. Validate every item against live DB stock ──────────────────────
    const resolvedItems = [];
    for (const item of rawItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isPublished)
        return next(makeError(`Product "${item.name || item.product}" is no longer available`, 400));

      const variation = product.variations.id(item.variationId);
      if (!variation)
        return next(makeError(`Selected size/concentration not found for "${product.name}"`, 400));

      if (variation.stockQuantity < item.quantity)
        return next(makeError(
          `Only ${variation.stockQuantity} unit(s) of "${product.name} (${variation.size}ml)" remain in stock`,
          400
        ));

      resolvedItems.push({
        product:       product._id,
        variationId:   variation._id,
        name:          product.name,
        brand:         product.brand,
        sku:           variation.sku,
        size:          variation.size,
        concentration: variation.concentration,
        image:         product.images[0] || '',
        unitPrice:     variation.price,          // authoritative server-side price
        quantity:      item.quantity,
        subtotal:      variation.price * item.quantity,
      });
    }

    // ── 2. Pricing (server-side, never trust the frontend total) ──────────
    const itemsTotal  = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const shippingFee = itemsTotal >= 5000 ? 0 : 200;   // free shipping over 5000 PKR
    const totalAmount = itemsTotal + shippingFee;

    // ── 3. Create the Order document ──────────────────────────────────────
    const [order] = await Order.create(
      [{
        user:            req.user._id,
        cartItems:       resolvedItems,
        itemsTotal,
        shippingFee,
        discount:        0,
        totalAmount,
        couponCode:      couponCode || undefined,
        shippingAddress,
        paymentMethod,
        paymentStatus:   'Pending',
        orderStatus:     'Processing',
        statusHistory:   [{ status: 'Processing', changedAt: new Date() }],
      }],
      { session }
    );

    // ── 4. Reserve stock (decrement immediately) ──────────────────────────
    for (const item of resolvedItems) {
      await Product.updateOne(
        { _id: item.product, 'variations._id': item.variationId },
        {
          $inc: { 'variations.$.stockQuantity': -item.quantity },
          $set: { 'variations.$.inStock': true },   // recalculated by pre-save on next update
        },
        { session }
      );
    }

    await session.commitTransaction();

    // Attach order to user's order history (non-transactional, best-effort)
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } }).catch(() => {});

    // Asynchronously dispatch luxury order confirmation email with attached PDF invoice
    (async () => {
      try {
        const userEmail = req.user.email;
        if (userEmail) {
          const invoiceBuffer = await pdfService.generateInvoiceBuffer(order);
          const orderRef = `MA-${order._id.toString().slice(-8).toUpperCase()}`;

          await emailService.sendEmail({
            to: userEmail,
            subject: `Order Confirmed: #${orderRef} - Mahid Aromas`,
            html: orderConfirmationTemplate(order),
            attachments: [
              {
                filename: `Invoice-${orderRef}.pdf`,
                content: invoiceBuffer,
                contentType: 'application/pdf',
              },
            ],
          });
        }
      } catch (emailErr) {
        console.error('⚠️ [OrderController] Non-fatal confirmation email error:', emailErr.message);
      }
    })();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my  — paginated list of the current user's orders
// ─────────────────────────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Math.max(1, +page) - 1) * Math.min(50, Math.max(1, +limit));

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(+limit)
        .select('-adminNotes -stripePaymentIntentId -jazzCashTxRef'),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({ success: true, total, page: +page, data: orders });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id  — fetch a single order (owner or admin only)
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('-adminNotes -stripePaymentIntentId -jazzCashTxRef');

    if (!order) return next(makeError('Order not found', 404));

    // Only the owner or an admin can view the order
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) return next(makeError('Not authorised to view this order', 403));

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/stripe/create-payment-intent
// Creates a Stripe PaymentIntent and returns the clientSecret to the frontend.
// ─────────────────────────────────────────────────────────────────────────────
const createStripePaymentIntent = async (req, res, next) => {
  try {
    if (!stripe) return next(makeError('Stripe is not configured on this server', 503));

    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order)                                         return next(makeError('Order not found', 404));
    if (order.user.toString() !== req.user._id.toString()) return next(makeError('Forbidden', 403));
    if (order.paymentStatus === 'Paid')                 return next(makeError('Order already paid', 400));

    // Stripe amounts are in the smallest currency unit.
    // PKR is a zero-decimal currency in Stripe's eyes, so multiply × 1 only.
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(order.totalAmount), // PKR — already in smallest unit
      currency: 'pkr',
      metadata: {
        orderId:     order._id.toString(),
        orderRef:    `MA-${order._id.toString().slice(-8).toUpperCase()}`,
        customerEmail: req.user.email,
      },
    });

    // Persist the PaymentIntent ID for webhook reconciliation
    await Order.findByIdAndUpdate(orderId, {
      stripePaymentIntentId: paymentIntent.id,
    });

    res.json({
      success:      true,
      clientSecret: paymentIntent.client_secret,
      orderId:      order._id,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/stripe/webhook  (raw body — configured in server.js)
// Stripe calls this endpoint to notify us of payment events.
// ─────────────────────────────────────────────────────────────────────────────
const stripeWebhook = async (req, res, next) => {
  if (!stripe) return res.status(503).send('Stripe not configured');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,                               // raw Buffer (express.raw middleware)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order  = await Order.findOne({ stripePaymentIntentId: intent.id });

    if (order && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      order.paidAt        = new Date();
      await order.save();
      // TODO: trigger confirmation email here
      console.log(`✅  Stripe payment confirmed for order ${order._id}`);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { paymentStatus: 'Failed' }
    );
  }

  res.json({ received: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/jazzcash/initiate
// Generates the secure JazzCash transaction payload for the frontend to POST
// directly to the JazzCash customer portal (form redirect pattern).
// ─────────────────────────────────────────────────────────────────────────────
const initiateJazzCash = async (req, res, next) => {
  try {
    const { orderId, mobileNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order)                                              return next(makeError('Order not found', 404));
    if (order.user.toString() !== req.user._id.toString())  return next(makeError('Forbidden', 403));
    if (order.paymentStatus === 'Paid')                     return next(makeError('Order already paid', 400));
    if (order.paymentMethod !== 'JazzCash')                 return next(makeError('Order payment method is not JazzCash', 400));

    if (!mobileNumber || !/^03[0-9]{9}$/.test(mobileNumber))
      return next(makeError('Valid Pakistani mobile number required (e.g. 03001234567)', 400));

    // Unique transaction reference (max 20 chars per JazzCash spec)
    const txnRef      = `T${Date.now()}`;
    const txnDateTime = jcDate();
    const txnExpiry   = jcDate(addMinutes(new Date(), 30));

    // Amount in PKR (JazzCash accepts full rupees for wallet transactions)
    const amount = Math.round(order.totalAmount).toString();

    const params = {
      pp_Amount:          amount,
      pp_BillReference:   `MA-${order._id.toString().slice(-8).toUpperCase()}`,
      pp_Description:     `Mahid Aromas Order ${txnRef}`,
      pp_Language:        'EN',
      pp_MerchantID:      process.env.JAZZCASH_MERCHANT_ID || '',
      pp_MobileNumber:    mobileNumber,
      pp_Password:        process.env.JAZZCASH_PASSWORD || '',
      pp_ReturnURL:       process.env.JAZZCASH_RETURN_URL || `http://localhost:5000/api/orders/jazzcash/callback`,
      pp_SubMerchantID:   '',
      pp_TxnCurrency:     'PKR',
      pp_TxnDateTime:     txnDateTime,
      pp_TxnExpiryDateTime: txnExpiry,
      pp_TxnRefNo:        txnRef,
      pp_TxnType:         'MWALLET',
      ppmpf_1:            order._id.toString(),  // store orderId for callback lookup
      ppmpf_2:            '',
      ppmpf_3:            '',
      ppmpf_4:            '',
      ppmpf_5:            '',
    };

    params.pp_SecureHash = generateJazzCashHash(params);

    // Save the txnRef so the callback can look up this order
    await Order.findByIdAndUpdate(orderId, { jazzCashTxRef: txnRef });

    res.json({
      success:    true,
      postUrl:    process.env.JAZZCASH_API_URL ||
                  'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
      params,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/jazzcash/callback  (PUBLIC — no auth, called by JazzCash)
// JazzCash posts the payment result here. We verify the hash and update the order.
// ─────────────────────────────────────────────────────────────────────────────
const jazzCashCallback = async (req, res, next) => {
  try {
    const payload     = req.body;
    const receivedHash = payload.pp_SecureHash;
    delete payload.pp_SecureHash;   // exclude hash from re-computation

    const computedHash = generateJazzCashHash(payload);

    if (computedHash !== receivedHash) {
      console.error('JazzCash hash mismatch — possible tampering');
      return res.redirect(`${process.env.CLIENT_URL}/checkout?error=payment_failed`);
    }

    // Response code '000' = success, any other code = failure
    const responseCode = payload.pp_ResponseCode;
    const orderId      = payload.ppmpf_1; // we stashed the orderId here
    const txnRef       = payload.pp_TxnRefNo;

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`JazzCash callback: order ${orderId} not found`);
      return res.redirect(`${process.env.CLIENT_URL}/checkout?error=order_not_found`);
    }

    if (responseCode === '000') {
      order.paymentStatus   = 'Paid';
      order.paidAt          = new Date();
      order.jazzCashTxRef   = txnRef;
      await order.save();
      console.log(`✅  JazzCash payment confirmed for order ${order._id}`);
      return res.redirect(`${process.env.CLIENT_URL}/order-success/${order._id}?via=jazzcash`);
    } else {
      order.paymentStatus = 'Failed';
      await order.save();
      console.warn(`❌  JazzCash payment failed (code ${responseCode}) for order ${order._id}`);
      return res.redirect(`${process.env.CLIENT_URL}/checkout?error=jazzcash_failed&code=${responseCode}`);
    }
  } catch (err) {
    console.error('JazzCash callback error:', err.message);
    return res.redirect(`${process.env.CLIENT_URL}/checkout?error=server_error`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  (Admin) — paginated list of all orders with filters
// ─────────────────────────────────────────────────────────────────────────────
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, orderStatus, paymentStatus, paymentMethod } = req.query;
    const skip = (Math.max(1, +page) - 1) * Math.min(100, Math.max(1, +limit));
    const filter = {};
    if (orderStatus)   filter.orderStatus   = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(+limit)
        .populate('user', 'name email phone'),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: +page, data: orders });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/status  (Admin) — update order status
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, adminNotes } = req.body;
    const validStatuses = ['Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus))
      return next(makeError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));

    const order = await Order.findById(req.params.id);
    if (!order) return next(makeError('Order not found', 404));

    order.orderStatus = orderStatus;
    if (adminNotes) order.adminNotes = adminNotes;
    await order.save();

    res.json({ success: true, message: `Order status updated to "${orderStatus}"`, data: order });
  } catch (err) { next(err); }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  createStripePaymentIntent,
  stripeWebhook,
  initiateJazzCash,
  jazzCashCallback,
  getAllOrdersAdmin,
  updateOrderStatus,
};
