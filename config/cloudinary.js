const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ─── Configure Cloudinary v2 SDK ─────────────────────────────────────────────
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ─── Configure Multer Cloudinary Storage Engine ──────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mahid_aromas_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      {
        width: 1000,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
    public_id: (req, file) => {
      const cleanName = file.originalname
        .split('.')[0]
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      return `perfume_${cleanName}_${Date.now()}`;
    },
  },
});

// File filter for image mime types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// ─── Initialize Multer Middleware ─────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size limit
  },
});

module.exports = {
  cloudinary,
  upload,
};
