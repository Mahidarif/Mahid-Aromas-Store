/**
 * seeder.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *   node seeder.js          → imports seed data
 *   node seeder.js --delete → wipes the Products and Users collections
 *
 * Run ONCE to get realistic data into your local MongoDB for development.
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const bcrypt   = require('bcryptjs');
const dns      = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fallback
}

dotenv.config();

const Product = require('./models/Product');
const User    = require('./models/User');

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const users = [
  {
    name:     'Admin User',
    email:    'admin@mahidaromas.com',
    password: 'Admin@1234',       // will be hashed by pre-save hook
    role:     'admin',
    phone:    '03001234567',
  },
  {
    name:     'Sara Ahmed',
    email:    'sara@example.com',
    password: 'Customer@1234',
    role:     'user',
    phone:    '03211234567',
  },
];

const products = [
  // ── 1. Oud Royale ─────────────────────────────────────────────────────────
  {
    name:             'Oud Royale',
    brand:            'Mahid Aromas',
    shortDescription: 'A majestic blend of pure Arabian Oud and velvety rose — for those who command presence.',
    description: `
      Oud Royale is our flagship fragrance. Inspired by the ancient perfumery traditions of the Arabian Peninsula,
      it opens with a burst of saffron-infused bergamot before revealing a deeply romantic heart of Damascene rose
      and oud wood. The drydown is a warm, resinous embrace of sandalwood and ambergris that lingers for hours.
      A scent that tells the world you have arrived.
    `.trim(),
    fragranceFamily: 'Oriental / Gourmand',
    gender:          'Unisex',
    notes: {
      top:   ['Saffron', 'Bergamot', 'Cardamom'],
      heart: ['Damascene Rose', 'Oud Wood', 'Jasmine'],
      base:  ['Sandalwood', 'Ambergris', 'Musk', 'Vanilla'],
    },
    variations: [
      {
        size:           50,
        concentration:  'Eau de Parfum (EDP)',
        price:          5500,
        compareAtPrice: 6500,
        sku:            'MA-OUD-50-EDP',
        stockQuantity:  30,
      },
      {
        size:           100,
        concentration:  'Eau de Parfum (EDP)',
        price:          9800,
        compareAtPrice: 11500,
        sku:            'MA-OUD-100-EDP',
        stockQuantity:  18,
      },
      {
        size:           100,
        concentration:  'Parfum / Extrait',
        price:          14500,
        sku:            'MA-OUD-100-PAR',
        stockQuantity:  8,
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
    ],
    rating:      4.8,
    numReviews:  124,
    tags:        ['bestseller', 'oud', 'luxury', 'gift-set'],
    isPublished: true,
  },

  // ── 2. Blanc Lumière ──────────────────────────────────────────────────────
  {
    name:             'Blanc Lumière',
    brand:            'Mahid Aromas',
    shortDescription: 'A weightless floral-citrus for the woman who glows — effortlessly radiant, all day long.',
    description: `
      Blanc Lumière — "White Light" in French — is a luminous, airy fragrance that captures the feeling
      of morning sunlight through sheer curtains. The opening is a sparkling citrus burst, evolving into
      a delicate bouquet of white florals. The base is soft, clean, and entirely addictive.
    `.trim(),
    fragranceFamily: 'Floral',
    gender:          'Women',
    notes: {
      top:   ['Yuzu', 'Lemon Blossom', 'White Peach'],
      heart: ['Magnolia', 'Lily of the Valley', 'Peony', 'Orris'],
      base:  ['White Musk', 'Cedarwood', 'Cashmere Wood'],
    },
    variations: [
      {
        size:          30,
        concentration: 'Eau de Parfum (EDP)',
        price:         3200,
        sku:           'MA-BL-30-EDP',
        stockQuantity: 45,
      },
      {
        size:           50,
        concentration:  'Eau de Parfum (EDP)',
        price:          5200,
        compareAtPrice: 5800,
        sku:            'MA-BL-50-EDP',
        stockQuantity:  35,
      },
      {
        size:          100,
        concentration: 'Eau de Parfum (EDP)',
        price:         8800,
        sku:           'MA-BL-100-EDP',
        stockQuantity: 20,
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800',
      'https://images.unsplash.com/photo-1566977776052-6e61e35bf9be?w=800',
    ],
    rating:      4.6,
    numReviews:  89,
    tags:        ['new-arrival', 'floral', 'women', 'office-wear'],
    isPublished: true,
  },

  // ── 3. Noir Absolu ────────────────────────────────────────────────────────
  {
    name:             'Noir Absolu',
    brand:            'Mahid Aromas',
    shortDescription: 'Deep, smoky, and unapologetically masculine — the scent of ambition after dark.',
    description: `
      Noir Absolu is a bold, architectural fragrance built for the modern gentleman. Black pepper and
      grapefruit ignite the opening, giving way to a potent heart of leather and vetiver. The base
      anchors everything in dark, smoky woods — a signature that doesn't ask for attention, it commands it.
    `.trim(),
    fragranceFamily: 'Woody',
    gender:          'Men',
    notes: {
      top:   ['Black Pepper', 'Grapefruit', 'Juniper Berry'],
      heart: ['Leather', 'Vetiver', 'Violet Leaf', 'Elemi'],
      base:  ['Smoked Patchouli', 'Labdanum', 'Dark Amber', 'Oakmoss'],
    },
    variations: [
      {
        size:           50,
        concentration:  'Eau de Toilette (EDT)',
        price:          4200,
        sku:            'MA-NA-50-EDT',
        stockQuantity:  25,
      },
      {
        size:           100,
        concentration:  'Eau de Toilette (EDT)',
        price:          7200,
        compareAtPrice: 8000,
        sku:            'MA-NA-100-EDT',
        stockQuantity:  40,
      },
      {
        size:           100,
        concentration:  'Eau de Parfum (EDP)',
        price:          9500,
        sku:            'MA-NA-100-EDP',
        stockQuantity:  15,
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800',
      'https://images.unsplash.com/photo-1550587780-efdce18f14e5?w=800',
    ],
    rating:      4.7,
    numReviews:  203,
    tags:        ['bestseller', 'masculine', 'woody', 'evening'],
    isPublished: true,
  },

  // ── 4. Rose Éternelle ─────────────────────────────────────────────────────
  {
    name:             'Rose Éternelle',
    brand:            'Mahid Aromas',
    shortDescription: 'The quintessential rose — reimagined with modern elegance and timeless depth.',
    description: `
      Rose Éternelle is our love letter to the most iconic floral in perfumery. Unlike one-dimensional
      rose soliflores, this fragrance layers three distinct roses — Bulgarian, Turkish, and Taif —
      to create an unprecedented complexity. A whisper of oud in the base ensures it lingers like a
      treasured memory.
    `.trim(),
    fragranceFamily: 'Floral',
    gender:          'Women',
    notes: {
      top:   ['Pink Pepper', 'Bergamot', 'Lychee'],
      heart: ['Bulgarian Rose', 'Turkish Rose Absolute', 'Taif Rose', 'Geranium'],
      base:  ['White Oud', 'Benzoin', 'Musk', 'Ambrette Seed'],
    },
    variations: [
      {
        size:          50,
        concentration: 'Eau de Parfum (EDP)',
        price:         6800,
        sku:           'MA-RE-50-EDP',
        stockQuantity: 20,
      },
      {
        size:           100,
        concentration:  'Eau de Parfum (EDP)',
        price:          11500,
        compareAtPrice: 13000,
        sku:            'MA-RE-100-EDP',
        stockQuantity:  12,
      },
      {
        size:          100,
        concentration: 'Parfum / Extrait',
        price:         18000,
        sku:           'MA-RE-100-PAR',
        stockQuantity: 5,
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=800',
      'https://images.unsplash.com/photo-1590156562745-5f12c1defe52?w=800',
    ],
    rating:      4.9,
    numReviews:  67,
    tags:        ['luxury', 'floral', 'rose', 'gift-set', 'new-arrival'],
    isPublished: true,
  },
];

// ─── Import ───────────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  MongoDB connected');

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️   Existing data cleared');

    // Insert users (passwords are hashed by the pre-save hook)
    const createdUsers = await User.insertMany(users);
    const adminUser    = createdUsers[0];
    console.log(`👤  Users seeded (admin: ${adminUser.email})`);

    // Insert products with pre-save hooks (for automatic slug generation)
    for (const p of products) {
      await Product.create(p);
    }
    console.log(`🌸  Products seeded (${products.length} items)`);

    console.log('\n🎉  Database seeded successfully!\n');
    console.log('   Admin credentials:');
    console.log('   Email   : admin@mahidaromas.com');
    console.log('   Password: Admin@1234\n');

    process.exit(0);
  } catch (err) {
    console.error(`❌  Seeder error: ${err.message}`);
    process.exit(1);
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  MongoDB connected');

    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️   All data deleted successfully');
    process.exit(0);
  } catch (err) {
    console.error(`❌  Seeder error: ${err.message}`);
    process.exit(1);
  }
};

// ─── CLI Entry ────────────────────────────────────────────────────────────────
if (process.argv[2] === '--delete') {
  deleteData();
} else {
  importData();
}
