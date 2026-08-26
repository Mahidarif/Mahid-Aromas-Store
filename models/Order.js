const mongoose = require('mongoose');

// ─── Sub-Schema: Cart Item ────────────────────────────────────────────────────
// A snapshot of what the customer purchased.  We store redundant fields (name,
// price, sku) intentionally — product prices can change, but order history must
// reflect what was charged at the time of purchase.
const cartItemSchema = new mongoose.Schema(
  {
    // Reference to the parent Product document
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Product',
      required: [true, 'Product reference is required'],
    },

    // The specific variation _id within that product's variations array
    variationId: {
      type:     mongoose.Schema.Types.ObjectId,
      required: [true, 'Variation ID is required'],
    },

    // ── Snapshot fields (denormalised for immutable order history) ───────────
    name:          { type: String, required: true }, // "Bleu de Chanel"
    brand:         { type: String, required: true }, // "Chanel"
    sku:           { type: String, required: true }, // "BDC-100-EDP"
    size:          { type: Number, required: true }, // 100 (ml)
    concentration: { type: String, required: true }, // "Eau de Parfum (EDP)"
    image:         { type: String },                 // primary image URL at time of order

    // Unit price at the moment of checkout (NOT the current live price)
    unitPrice: {
      type:     Number,
      required: [true, 'Unit price is required'],
      min:      [0, 'Unit price cannot be negative'],
    },

    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [1, 'Quantity must be at least 1'],
    },

    // Convenience field: unitPrice × quantity (kept in sync in controller)
    subtotal: {
      type:     Number,
      required: true,
      min:      [0, 'Subtotal cannot be negative'],
    },
  },
  { _id: true }
);

// ─── Sub-Schema: Shipping Address ─────────────────────────────────────────────
// Embedded directly on the Order so it's immutable post-placement.
// A separate copy lives in User.savedAddresses for future re-use.
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName:     { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city:         { type: String, required: true, trim: true },
    province:     { type: String, required: true, trim: true },
    postalCode:   { type: String, trim: true },
    country:      { type: String, default: 'Pakistan', trim: true },
  },
  { _id: false }
);

// ─── Main Order Schema ────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── Customer Reference ────────────────────────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Order must be associated with a user'],
      index:    true,
    },

    // ── Cart Items (immutable snapshot) ──────────────────────────────────────
    cartItems: {
      type:     [cartItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message:   'An order must contain at least one item',
      },
    },

    // ── Pricing Breakdown ─────────────────────────────────────────────────────
    itemsTotal:   { type: Number, required: true, min: 0 }, // sum of all subtotals
    shippingFee:  { type: Number, default: 0,     min: 0 }, // flat shipping charge
    discount:     { type: Number, default: 0,     min: 0 }, // coupon / promo discount
    totalAmount:  { type: Number, required: true, min: 0 }, // final charged amount

    // Optional coupon code reference for analytics
    couponCode: { type: String, trim: true, uppercase: true },

    // ── Shipping Address (snapshot at order time) ─────────────────────────────
    shippingAddress: {
      type:     shippingAddressSchema,
      required: [true, 'Shipping address is required'],
    },

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentMethod: {
      type:     String,
      enum:     ['Card', 'JazzCash', 'COD'],
      required: [true, 'Payment method is required'],
    },

    paymentStatus: {
      type:    String,
      enum:    ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index:   true,
    },

    // Stripe payment intent ID (populated after Card payment confirmation)
    stripePaymentIntentId: { type: String, select: false },

    // JazzCash transaction reference (populated after wallet callback)
    jazzCashTxRef: { type: String, select: false },

    // Timestamp of payment confirmation
    paidAt: { type: Date },

    // ── Order Lifecycle Status ────────────────────────────────────────────────
    orderStatus: {
      type:    String,
      enum:    ['Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
      index:   true,
    },

    // Timestamps for each status transition (for analytics & SLA tracking)
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String }, // e.g. "Customer requested cancellation"
        _id:       false,
      },
    ],

    // ── Logistics / Courier ───────────────────────────────────────────────────
    // Populated automatically when admin clicks "Generate AWB"
    courierName: {
      type: String,
      enum: ['TCS', 'Leopards', 'Trax', 'PostEx', 'CallCourier', 'Other'],
    },

    courierTrackingNumber: {
      type:  String,
      trim:  true,
      index: true, // Indexed so admins/customers can look up by tracking number
    },

    // Direct URL to the courier's tracking page (sent to customer via email)
    awbUrl: {
      type: String,
      trim: true,
    },

    // URL or file path to the downloadable AWB PDF label
    awbPdfUrl: {
      type: String,
      trim: true,
    },

    // URL or file path to the generated invoice PDF
    invoicePdfUrl: {
      type: String,
      trim: true,
    },

    // Timestamp when the shipment was booked with the courier
    shippedAt: { type: Date },

    // Timestamp when the customer confirmed receipt
    deliveredAt: { type: Date },

    // ── Special Instructions ──────────────────────────────────────────────────
    customerNotes: {
      type:      String,
      trim:      true,
      maxlength: [500, 'Customer notes cannot exceed 500 characters'],
    },

    // Internal-only field for admin notes (never exposed to customer)
    adminNotes: {
      type:   String,
      trim:   true,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt = order placement time
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Compound index for admin dashboard queries (filter by status + sort by date)
orderSchema.index({ orderStatus: 1, createdAt: -1 });
// Index for payment reconciliation queries
orderSchema.index({ paymentMethod: 1, paymentStatus: 1 });

// ─── Virtual: Order Reference Number ─────────────────────────────────────────
// Human-readable ID displayed to customers (e.g. "MA-001A2B3C")
orderSchema.virtual('orderRef').get(function () {
  return `MA-${this._id.toString().slice(-8).toUpperCase()}`;
});

// ─── Virtual: Is COD? ─────────────────────────────────────────────────────────
orderSchema.virtual('isCOD').get(function () {
  return this.paymentMethod === 'COD';
});

// ─── Pre-Save Hook: Append Status History ────────────────────────────────────
// Whenever orderStatus changes, push a record to statusHistory automatically.
orderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({ status: this.orderStatus, changedAt: new Date() });

    // Auto-set timestamp fields on key transitions
    if (this.orderStatus === 'Shipped'   && !this.shippedAt)   this.shippedAt   = new Date();
    if (this.orderStatus === 'Delivered' && !this.deliveredAt) this.deliveredAt = new Date();
  }

  // Auto-set paidAt when paymentStatus flips to 'Paid'
  if (this.isModified('paymentStatus') && this.paymentStatus === 'Paid' && !this.paidAt) {
    this.paidAt = new Date();
  }

  next();
});

module.exports = mongoose.model('Order', orderSchema);
