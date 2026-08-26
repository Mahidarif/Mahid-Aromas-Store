const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

/**
 * POST /api/upload
 * Protected route for administrators to upload product media to Cloudinary.
 * Accepts a single file in multipart/form-data under the field name "image".
 */
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  (req, res, next) => {
    try {
      if (!req.file) {
        const error = new Error('No image file provided');
        error.statusCode = 400;
        return next(error);
      }

      // Cloudinary multer storage populates req.file.path with the secure HTTPS URL
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully to Cloudinary',
        url: req.file.path,
        filename: req.file.filename,
        format: req.file.format,
        size: req.file.size,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
