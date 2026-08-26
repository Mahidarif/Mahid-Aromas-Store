const express = require('express');
const router  = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  createStripePaymentIntent,
  stripeWebhook,
  initiateJazzCash,
  jazzCashCallback,
  getAllOrdersAdmin,
  updateOrderStatus,
} = require('../controllers/orderController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

// ─── Public (no auth) ─────────────────────────────────────────────────────────
// JazzCash posts the payment result here — must be public, no JWT
router.post('/jazzcash/callback', jazzCashCallback);

// ─── Stripe webhook — raw body already handled by server.js middleware ────────
router.post(
  '/stripe/webhook',
  // Note: express.raw() is applied selectively in server.js before this route
  stripeWebhook
);

// ─── Authenticated user routes ────────────────────────────────────────────────
router.post('/',                        protect, createOrder);
router.get('/my',                       protect, getMyOrders);
router.get('/:id',                      protect, getOrderById);
router.post('/stripe/payment-intent',   protect, createStripePaymentIntent);
router.post('/jazzcash/initiate',       protect, initiateJazzCash);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get ('/',           protect, adminOnly, getAllOrdersAdmin);
router.put ('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
