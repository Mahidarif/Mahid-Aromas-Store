const express = require('express');
const router  = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} = require('../controllers/productController');

const { protect, adminOnly } = require('../middlewares/authMiddleware');

// ─── Public routes ─────────────────────────────────────────────────────────────
// GET /api/products            — paginated storefront listing
// GET /api/products/:id        — single product (also accepts slug)
router.get('/',    getProducts);
router.get('/:id', getProductById);

// ─── Admin-only routes ─────────────────────────────────────────────────────────
// GET    /api/products/admin/all  — full inventory (incl. unpublished)
// POST   /api/products            — create new product
// PUT    /api/products/:id        — update product / patch variation stock
// DELETE /api/products/:id        — soft-delete (unpublish)
router.get   ('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.post  ('/',          protect, adminOnly, createProduct);
router.put   ('/:id',       protect, adminOnly, updateProduct);
router.delete('/:id',       protect, adminOnly, deleteProduct);

module.exports = router;
