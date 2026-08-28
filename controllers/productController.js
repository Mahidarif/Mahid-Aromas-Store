const Product = require('../models/Product');

// ─── GET /api/products ────────────────────────────────────────────────────────
// Supports: ?search=oud  ?fragranceFamily=Woody  ?gender=Men
//           ?page=1  ?limit=12  ?sort=price_asc|price_desc|newest|rating
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      fragranceFamily,
      gender,
      brand,
      page  = 1,
      limit = 12,
      sort  = 'newest',
    } = req.query;

    // ── Build filter object ───────────────────────────────────────────────────
    const filter = { isPublished: true };

    // Full-text search across name, brand, description, tags
    if (search) {
      filter.$text = { $search: search };
    }

    if (fragranceFamily) filter.fragranceFamily = fragranceFamily;
    if (gender)          filter.gender          = gender;

    // Case-insensitive brand filter (useful for brand pages)
    if (brand) {
      filter.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // ── Build sort object ─────────────────────────────────────────────────────
    const sortMap = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt: 1  },
      price_asc:  { 'variations.0.price': 1  }, // approximate — use aggregation for precise sort
      price_desc: { 'variations.0.price': -1 },
      rating:     { rating: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    // ── Pagination ────────────────────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10))); // cap at 50
    const skip     = (pageNum - 1) * limitNum;

    // ── Execute queries in parallel ───────────────────────────────────────────
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('name brand shortDescription fragranceFamily gender images rating numReviews variations tags slug'),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success:    true,
      totalCount,
      page:       pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      limit:      limitNum,
      data:       products,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
// Accepts MongoDB ObjectId, slug (e.g. "oud-royale"), or product identifier
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;

    // 1. If valid 24-hex ObjectId, try finding by _id first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }

    // 2. If not found or not ObjectId, search by slug
    if (!product) {
      product = await Product.findOne({ slug: id.toLowerCase().trim() });
    }

    // 3. Fallback: search by name (case-insensitive) or partial slug
    if (!product) {
      const formattedName = id.replace(/-/g, ' ');
      product = await Product.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${formattedName}$`, 'i') } },
          { slug: { $regex: new RegExp(`^${id}$`, 'i') } },
        ],
      });
    }

    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const Order   = require('../models/Order');

// ─── POST /api/products ───────────────────────────────────────────────────────
// Admin only.  Creates a new product.
const createProduct = async (req, res, next) => {
  try {
    const {
      name, brand, shortDescription, description,
      fragranceFamily, gender, season, notes, variations,
      images, tags, isPublished,
    } = req.body;

    // Required field check
    if (!name || !brand || !fragranceFamily || !variations || variations.length === 0) {
      const err = new Error('Name, brand, fragrance family, and at least one variation are required');
      err.statusCode = 400;
      return next(err);
    }

    const product = await Product.create({
      name, brand, shortDescription, description,
      fragranceFamily, gender, season, notes, variations,
      images: images || [],
      tags:   tags   || [],
      isPublished: isPublished ?? true,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data:    product,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
// Admin only.  Partial update — only provided fields are changed.
// Handles stock updates for individual variations cleanly.
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }

    // Fields that can be updated freely
    const updatableFields = [
      'name', 'brand', 'shortDescription', 'description',
      'fragranceFamily', 'gender', 'season', 'notes', 'images',
      'tags', 'isPublished', 'rating', 'numReviews',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // ── Variation stock update ─────────────────────────────────────────────
    // Accepts partial variation patches: { variationId, stockQuantity, price }
    // This lets admins update stock without sending the full variations array.
    if (req.body.variationPatch) {
      const { variationId, stockQuantity, price, compareAtPrice } = req.body.variationPatch;
      const variation = product.variations.id(variationId);

      if (!variation) {
        const err = new Error(`Variation with id "${variationId}" not found on this product`);
        err.statusCode = 404;
        return next(err);
      }

      if (stockQuantity !== undefined) {
        variation.stockQuantity = stockQuantity;
        variation.inStock       = stockQuantity > 0;
      }
      if (price !== undefined)          variation.price          = price;
      if (compareAtPrice !== undefined) variation.compareAtPrice = compareAtPrice;
    }

    // ── Full variations replacement (admin sends complete array) ──────────
    if (req.body.variations) {
      product.variations = req.body.variations;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data:    updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
// Admin only. Soft-delete by unpublishing to protect order history references.
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      return next(err);
    }

    // Check if hard delete was explicitly requested
    if (req.query.permanent === 'true') {
      const existingOrder = await Order.findOne({ 'orderItems.product': product._id });
      if (existingOrder) {
        const err = new Error(
          'Cannot permanently delete product: Customer orders are linked to it. Product will be unpublished instead.'
        );
        err.statusCode = 400;
        product.isPublished = false;
        await product.save();
        return next(err);
      }

      await Product.findByIdAndDelete(product._id);
      return res.status(200).json({
        success: true,
        message: 'Product permanently deleted',
      });
    }

    // Default: Soft delete by unpublishing
    product.isPublished = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product unpublished (soft-deleted)',
      data:    product,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/products/admin/all ─────────────────────────────────────────────
// Admin only.  Returns ALL products (including unpublished) for the admin panel.
const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success:    true,
      totalCount,
      page:       pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data:       products,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
};
