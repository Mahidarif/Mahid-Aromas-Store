import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import api, { adminAPI } from '../../api/axiosConfig';

const FAMILIES = [
  'Oriental',
  'Floral',
  'Woody',
  'Fresh',
  'Aquatic',
  'Chypre',
  'Gourmand',
  'Fougère',
];

const GENDERS = [
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Unisex', value: 'Unisex' },
];

const SEASONS = ['All Season', 'Winter', 'Summer', 'Spring', 'Fall'];

const CONCENTRATIONS = [
  'Extrait de Parfum',
  'Eau de Parfum (EDP)',
  'Eau de Toilette (EDT)',
  'Attar / Pure Perfume Oil',
];

export default function ProductForm({ product, onClose, onSuccess }) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Mahid Aromas',
    description: '',
    fragranceFamily: 'Oriental',
    gender: 'Unisex',
    season: 'All Season',
    notes: { top: [], heart: [], base: [] },
    variations: [
      {
        size: 50,
        concentration: 'Extrait de Parfum',
        price: 12500,
        compareAtPrice: '',
        stockQuantity: 25,
      },
    ],
    images: [],
    tags: [],
    isActive: true,
  });

  const [noteInputs, setNoteInputs] = useState({ top: '', heart: '', base: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ─── Initialize Existing Product Data ──────────────────────────────────────
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || 'Mahid Aromas',
        description: product.description || '',
        fragranceFamily: product.fragranceFamily || 'Oriental',
        gender: product.gender || 'Unisex',
        season: product.season || 'All Season',
        notes: {
          top: product.notes?.top || [],
          heart: product.notes?.heart || [],
          base: product.notes?.base || [],
        },
        variations:
          product.variations && product.variations.length > 0
            ? product.variations
            : [
                {
                  size: 50,
                  concentration: 'Extrait de Parfum',
                  price: 12500,
                  compareAtPrice: '',
                  stockQuantity: 25,
                },
              ],
        images: product.images || [],
        tags: product.tags || [],
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    }
  }, [product]);

  // ─── Input Handlers ────────────────────────────────────────────────────────
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Olfactory Notes Tag Helpers ───────────────────────────────────────────
  const handleAddNote = (tier) => {
    const val = noteInputs[tier].trim();
    if (val && !formData.notes[tier].includes(val)) {
      setFormData((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [tier]: [...prev.notes[tier], val],
        },
      }));
      setNoteInputs((prev) => ({ ...prev, [tier]: '' }));
    }
  };

  const handleRemoveNote = (tier, noteToRemove) => {
    setFormData((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [tier]: prev.notes[tier].filter((n) => n !== noteToRemove),
      },
    }));
  };

  // ─── Bottle Variations Repeater Helpers ────────────────────────────────────
  const handleVariationChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.variations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variations: updated };
    });
  };

  const handleAddVariation = () => {
    setFormData((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          size: 100,
          concentration: 'Extrait de Parfum',
          price: 21000,
          compareAtPrice: '',
          stockQuantity: 15,
        },
      ],
    }));
  };

  const handleRemoveVariation = (index) => {
    if (formData.variations.length <= 1) {
      alert('At least one bottle variation is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }));
  };

  // ─── Cloudinary Image Upload ───────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImage(true);
    setError(null);

    try {
      for (const file of files) {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        uploadForm.append('upload_preset', 'mahid_aromas');

        const res = await api.post('/api/upload', uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrl =
          res.data?.url || res.data?.secure_url || res.data?.data?.url;
        if (uploadedUrl) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, uploadedUrl],
          }));
        }
      }
    } catch {
      const sampleFallback = URL.createObjectURL(files[0]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, sampleFallback],
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // ─── Form Submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (formData.variations.length === 0) {
      setError('At least one size variation is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        await adminAPI.updateProduct(product._id, formData);
      } else {
        await adminAPI.createProduct(formData);
      }
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save product. Please verify all fields.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 p-2.5 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
      
      {/* ── Modal Container (Optimized for Mobile Viewport) ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden text-slate-800 font-sans"
      >
        
        {/* ── Sticky Modal Header ───────────────────────────────────────────── */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 flex-shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-slate-700" />
              <span>{isEditing ? 'Edit Fragrance' : 'Add New Fragrance'}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              Configure product details, scent notes, and bottle inventory sizes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Modal Form Body ────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── SECTION 1: Essential Information ────────────────────────────── */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              1. Basic Identification
            </h3>

            {/* Product Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Product Name *
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="e.g. Oud Royale Extrait"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-colors bg-white text-slate-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Brand */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Brand / Maison
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white"
                />
              </div>

              {/* Fragrance Family */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Fragrance Family
                </label>
                <select
                  value={formData.fragranceFamily}
                  onChange={(e) =>
                    handleInputChange('fragranceFamily', e.target.value)
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white cursor-pointer"
                >
                  {FAMILIES.map((fam) => (
                    <option key={fam} value={fam}>
                      {fam}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Gender Target *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white cursor-pointer font-semibold"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Fragrance Story &amp; Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the inspiration, opening notes, and aura of this extrait..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white"
              />
            </div>
          </div>

          {/* ── SECTION 2: Olfactory Scent Pyramid ──────────────────────────── */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              2. Scent Pyramid Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['top', 'heart', 'base'].map((tier) => (
                <div key={tier} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 capitalize block">
                    {tier} Notes
                  </label>
                  
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder={`Add ${tier} note...`}
                      value={noteInputs[tier]}
                      onChange={(e) =>
                        setNoteInputs((prev) => ({
                          ...prev,
                          [tier]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNote(tier);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNote(tier)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Note Chips */}
                  <div className="flex flex-wrap gap-1 min-h-[28px]">
                    {formData.notes[tier].map((n) => (
                      <span
                        key={n}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700"
                      >
                        <span>{n}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNote(tier, n)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 3: Bottle Variations & Stock ────────────────────────── */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                3. Bottle Sizes &amp; Pricing
              </h3>
              <button
                type="button"
                onClick={handleAddVariation}
                className="text-xs text-slate-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add Bottle Size
              </button>
            </div>

            <div className="space-y-3">
              {formData.variations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-3 items-center"
                >
                  {/* Size */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Size (ml)
                    </label>
                    <input
                      type="number"
                      value={v.size}
                      onChange={(e) =>
                        handleVariationChange(idx, 'size', Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-semibold"
                    />
                  </div>

                  {/* Concentration */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Concentration
                    </label>
                    <select
                      value={v.concentration}
                      onChange={(e) =>
                        handleVariationChange(idx, 'concentration', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {CONCENTRATIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      required
                      value={v.price}
                      onChange={(e) =>
                        handleVariationChange(idx, 'price', Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Stock Qty
                    </label>
                    <input
                      type="number"
                      value={v.stockQuantity}
                      onChange={(e) =>
                        handleVariationChange(
                          idx,
                          'stockQuantity',
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  {/* Delete Variation */}
                  <div className="flex items-center justify-end col-span-2 sm:col-span-1 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(idx)}
                      disabled={formData.variations.length <= 1}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 4: Imagery & Cloudinary Upload ───────────────────────── */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              4. Flacon Photography
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 bg-white group"
                >
                  <img
                    src={imgUrl}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-rose-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Upload Dropzone Box */}
              <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                {uploadingImage ? (
                  <Loader2 size={20} className="animate-spin text-slate-500" />
                ) : (
                  <>
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-600">
                      Upload Image
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

        </form>

        {/* ── Sticky Modal Footer Actions ───────────────────────────────────── */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving Fragrance...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Publish Fragrance'}</span>
            )}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
