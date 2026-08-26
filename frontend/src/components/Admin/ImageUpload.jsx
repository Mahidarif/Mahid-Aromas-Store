import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosConfig';

/**
 * ImageUpload Component
 * 
 * Reusable image uploader for administrative product management.
 * Dispatches multipart/form-data to /api/upload and streams to Cloudinary.
 *
 * @param {Function} onUploadSuccess - Callback passing the secure Cloudinary URL (string)
 * @param {string} [initialImage] - Optional default image URL for edit mode
 * @param {string} [label] - Optional label above the uploader
 */
export default function ImageUpload({
  onUploadSuccess,
  initialImage = '',
  label = 'Product Image',
}) {
  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    // Client-side validations
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const secureUrl = response.data?.url;
      if (secureUrl) {
        setPreviewUrl(secureUrl);
        if (onUploadSuccess) {
          onUploadSuccess(secureUrl);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-sans font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden ${
          isDragOver
            ? 'border-gold bg-gold/5 shadow-gold-sm'
            : previewUrl
            ? 'border-white/10 bg-surface-2'
            : 'border-white/15 bg-surface hover:border-gold/40 hover:bg-surface-2'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/jpg"
          onChange={handleInputChange}
          className="hidden"
        />

        {previewUrl ? (
          /* ── Thumbnail Preview View ────────────────────────────────────────── */
          <div className="relative aspect-video sm:aspect-[16/9] w-full bg-midnight flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-contain"
            />

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-midnight/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <span className="text-xs font-sans text-text-primary flex items-center gap-1.5 bg-surface/90 px-3 py-1.5 rounded-lg border border-white/10">
                <ImageIcon size={14} className="text-gold" />
                Change Image
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                title="Remove Image"
              >
                <X size={16} />
              </button>
            </div>

            {/* Success indicator pill */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-sans">
              <CheckCircle2 size={11} /> Cloudinary Ready
            </div>
          </div>
        ) : (
          /* ── Empty Upload Dropzone View ────────────────────────────────────── */
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-white/8 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-200">
              {uploading ? (
                <Loader2 size={22} className="animate-spin text-gold" />
              ) : (
                <UploadCloud size={22} />
              )}
            </div>

            <div className="space-y-1">
              <p className="font-sans text-sm font-medium text-text-primary">
                {uploading ? (
                  'Optimizing & uploading to Cloudinary...'
                ) : (
                  <>
                    <span className="text-gold">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-[11px] text-text-muted font-sans">
                WebP, PNG, JPG up to 5MB (Auto-optimized at 1000px)
              </p>
            </div>
          </div>
        )}

        {/* Uploading progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-midnight/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 size={28} className="animate-spin text-gold" />
            <span className="text-xs font-sans font-medium text-text-primary tracking-wide">
              Uploading Media...
            </span>
          </div>
        )}
      </div>

      {/* Error alert message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl font-sans">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
