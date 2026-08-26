const mongoose = require('mongoose');

// ─── Sub-Schema: Product Variation ───────────────────────────────────────────
// Each variation represents a distinct purchasable unit (e.g. 50ml EDP, 100ml EDP).
// Having its own sub-document makes inventory tracking and cart operations clean.
const variationSchema = new mongoose.Schema(
  {
    size: {
      type:     Number, // in millilitres, e.g. 30, 50, 100
      required: [true, 'Variation size (ml) is required'],
    },

    // Concentration determines the fragrance strength tier
    concentration: {
      type: String,
      enum: [
        'Eau de Cologne (EDC)',
        'Eau de Toilette (EDT)',
        'Eau de Parfum (EDP)',
        'Parfum / Extrait',
      ],
      required: [true, 'Concentration is required'],
    },

    // Each size/concentration combo has its own retail price (PKR)
    price: {
      type:     Number,
      required: [true, 'Price is required'],
      min:      [0, 'Price cannot be negative'],
    },

    // Optional compare-at price for "was / now" sale display
    compareAtPrice: {
      type: Number,
      min:  [0, 'Compare-at price cannot be negative'],
    },

    // Stock Keeping Unit — must be globally unique across all products
    sku: {
      type:     String,
      required: [true, 'SKU is required'],
      unique:   true,
      trim:     true,
      uppercase: true,
    },

    stockQuantity: {
      type:     Number,
      required: [true, 'Stock quantity is required'],
      min:      [0, 'Stock cannot be negative'],
      default:  0,
    },

    // Convenience boolean — controllers should keep this in sync with stockQuantity
    inStock: {
      type:    Boolean,
      default: true,
    },
  },
  { _id: true }
);

// ─── Sub-Schema: Scent Notes ──────────────────────────────────────────────────
// Represents the fragrance pyramid: top → heart → base notes.
// Stored as arrays of strings for maximum flexibility.
const notesSchema = new mongoose.Schema(
  {
    top: {
      type:    [String],
      default: [],
      // e.g. ['Bergamot', 'Lemon', 'Pink Pepper']
    },
    heart: {
      type:    [String],
      default: [],
      // e.g. ['Rose', 'Jasmine', 'Iris']
    },
    base: {
      type:    [String],
      default: [],
      // e.g. ['Sandalwood', 'Musk', 'Amber', 'Vanilla']
    },
  },
  { _id: false } // No separate _id needed for this nested object
);

// ─── Main Product Schema ──────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Product name is required'],
      trim:     true,
    },

    brand: {
      type:     String,
      required: [true, 'Brand is required'],
      trim:     true,
      index:    true, // Indexed for fast brand-filtered queries
    },

    // Short marketing blurb for cards & meta descriptions
    shortDescription: {
      type:    String,
      trim:    true,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },

    // Full rich-text description (can store HTML from a WYSIWYG editor)
    description: {
      type:    String,
      trim:    true,
    },

    // Broad olfactive category for filtering & recommendations
    fragranceFamily: {
      type: String,
      enum: [
        'Floral',
        'Oriental / Gourmand',
        'Woody',
        'Fresh / Citrus',
        'Aquatic',
        'Aromatic / Fougère',
        'Chypre',
        'Leather',
      ],
      required: [true, 'Fragrance family is required'],
      index:    true,
    },

    // Gender target — affects filtering and display badges
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
      default: 'Unisex',
    },

    // Nested fragrance pyramid (top / heart / base)
    notes: {
      type:    notesSchema,
      default: () => ({}),
    },

    // At least one variation is required to make the product purchasable
    variations: {
      type:     [variationSchema],
      validate: {
        validator: (v) => v.length > 0,
        message:   'A product must have at least one variation',
      },
    },

    // Ordered array of image URLs (first image = primary display image)
    images: {
      type:    [String],
      default: [],
    },

    // Average rating (denormalised from reviews for fast reads)
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },

    // Total number of reviews (used alongside `rating`)
    numReviews: {
      type:    Number,
      default: 0,
    },

    // SEO-friendly URL slug (auto-generated or manually set)
    slug: {
      type:   String,
      unique: true,
      trim:   true,
      lowercase: true,
    },

    // Soft-delete / draft support — only published products appear in storefront
    isPublished: {
      type:    Boolean,
      default: false,
      index:   true,
    },

    // Optional tags for cross-category merchandising (e.g. 'bestseller', 'new-arrival')
    tags: {
      type:    [String],
      default: [],
    },
  },
  {
    timestamps: true,
    // Virtual fields (like `primaryImage`) are included when converting to JSON/Object
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Compound text index for storefront search bar
productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

// ─── Virtual: Primary Image ───────────────────────────────────────────────────
productSchema.virtual('primaryImage').get(function () {
  return this.images.length > 0 ? this.images[0] : null;
});

// ─── Virtual: Starting Price ──────────────────────────────────────────────────
// Returns the lowest price across all variations for "From PKR X" display
productSchema.virtual('startingPrice').get(function () {
  if (!this.variations || this.variations.length === 0) return null;
  return Math.min(...this.variations.map((v) => v.price));
});

// ─── Pre-Save Hook: Auto-generate Slug ────────────────────────────────────────
productSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')   // strip special chars
      .trim()
      .replace(/\s+/g, '-');          // spaces → hyphens
  }

  // Keep inStock flag in sync with stockQuantity for each variation
  if (this.variations) {
    this.variations.forEach((v) => {
      v.inStock = v.stockQuantity > 0;
    });
  }
});

module.exports = mongoose.model('Product', productSchema);
