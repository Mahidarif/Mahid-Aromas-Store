const Order = require('../models/Order');
const courierService = require('../services/courierService');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const { orderShippedTemplate } = require('../utils/emailTemplates');

const makeError = (msg, code = 500) => Object.assign(new Error(msg), { statusCode: code });

/**
 * GET /api/admin/orders
 * Fetches all orders with pagination, status filters, and populated customer info.
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, orderStatus, paymentStatus, paymentMethod } = req.query;
    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const skip = (Math.max(1, +page) - 1) * Math.min(100, Math.max(1, +limit));

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(+limit)
        .populate('user', 'name email phone'),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: +page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/orders/:id/status
 * Updates the lifecycle status of an order.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, adminNotes } = req.body;
    const validStatuses = ['Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return next(makeError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return next(makeError('Order not found', 404));

    order.orderStatus = orderStatus;
    if (adminNotes) order.adminNotes = adminNotes;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to "${orderStatus}"`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/orders/:id/generate-awb
 * Calls the corporate courier service adapter, saves AWB details,
 * and advances order status to "Ready to Ship".
 */
const generateOrderAWB = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return next(makeError('Order not found', 404));

    if (order.courierTrackingNumber) {
      return res.json({
        success: true,
        message: 'AWB already exists for this order',
        data: order,
      });
    }

    // Call corporate courier integration service
    const awbResult = await courierService.generateAWB(order, order.user);

    if (!awbResult.success) {
      return next(makeError('Failed to generate AWB from courier API', 502));
    }

    order.courierName = awbResult.courierName;
    order.courierTrackingNumber = awbResult.trackingNumber;
    order.awbUrl = awbResult.awbUrl;
    order.orderStatus = 'Ready to Ship';

    await order.save();

    // Asynchronously dispatch luxury shipment email with courier tracking URL
    (async () => {
      try {
        const customerEmail = order.user?.email || order.shippingAddress?.email;
        if (customerEmail) {
          const orderRef = `MA-${order._id.toString().slice(-8).toUpperCase()}`;

          await emailService.sendEmail({
            to: customerEmail,
            subject: `Your Order Has Shipped! Tracking #${order.courierTrackingNumber} - Mahid Aromas`,
            html: orderShippedTemplate(order),
          });
        }
      } catch (emailErr) {
        console.error('⚠️ [AdminController] Non-fatal shipment email error:', emailErr.message);
      }
    })();

    res.json({
      success: true,
      message: `AWB Generated: ${order.courierTrackingNumber}`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/orders/:id/invoice
 * Generates and streams a PDF invoice for the specified order.
 */
const downloadOrderInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return next(makeError('Order not found', 404));

    pdfService.generateInvoiceStream(order, res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  generateOrderAWB,
  downloadOrderInvoice,
};
