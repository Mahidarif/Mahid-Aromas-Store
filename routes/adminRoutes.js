const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  updateOrderStatus,
  generateOrderAWB,
  downloadOrderInvoice,
} = require('../controllers/adminController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// Order fulfillment & Logistics
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/generate-awb', generateOrderAWB);
router.get('/orders/:id/invoice', downloadOrderInvoice);

module.exports = router;
