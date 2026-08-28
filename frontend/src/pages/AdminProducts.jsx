import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronDown,
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import api, { adminAPI } from '../api/axiosConfig';
import ProductForm from '../components/Admin/ProductForm';

const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

const CATEGORIES = [
  'All',
  'Oriental',
  'Floral',
  'Woody',
  'Fresh',
  'Aquatic',
  'Chypre',
];

const GENDERS = [
  { label: 'All Genders', value: 'All' },
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Unisex', value: 'Unisex' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterGender, setFilterGender] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Fetch Products ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products', { params: { limit: 200 } });
      setProducts(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch catalog.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── Filter Logic ──────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name?.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q);

      const matchesCategory =
        filterCategory === 'All' ||
        product.fragranceFamily
          ?.toLowerCase()
          .includes(filterCategory.toLowerCase());

      const matchesGender =
        filterGender === 'All' ||
        (product.gender || 'Unisex').toLowerCase() === filterGender.toLowerCase();

      return matchesSearch && matchesCategory && matchesGender;
    });
  }, [products, searchTerm, filterCategory, filterGender]);

  // ─── Dynamic KPI Calculations ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    let totalVal = 0;
    let lowStock = 0;
    let outStock = 0;

    filteredProducts.forEach((p) => {
      if (p.variations && Array.isArray(p.variations)) {
        p.variations.forEach((v) => {
          const qty = Number(v.stockQuantity) || 0;
          const prc = Number(v.price) || 0;
          totalVal += prc * qty;

          if (qty === 0) outStock++;
          else if (qty > 0 && qty <= 5) lowStock++;
        });
      }
    });

    return {
      totalProducts: filteredProducts.length,
      totalInventoryValue: totalVal,
      lowStockCount: lowStock,
      outOfStockCount: outStock,
    };
  }, [filteredProducts]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to unpublish "${name}"?`)) return;

    try {
      await adminAPI.deleteProduct(id);
      showToast(`"${name}" has been deleted.`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchProducts();
    showToast(
      editingProduct
        ? 'Product updated successfully!'
        : 'New perfume added to catalog!'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800 w-full overflow-hidden">
      
      {/* ── Toast Notification ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header Title & Actions ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inventory &amp; Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your fragrances, bottle variations, and live stock.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Fragrance</span>
        </button>
      </div>

      {/* ── 1. KPI Summary Cards Grid (Mobile Stacked: 1 or 2 cols) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Total Products */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Fragrances
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {kpis.totalProducts}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Live in active catalog
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Package size={18} />
          </div>
        </div>

        {/* Total Valuation */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Value
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">
              {formatPKR(kpis.totalInventoryValue)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Across all variations
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Alert
            </p>
            <p className="text-xl sm:text-2xl font-bold text-amber-700">
              {kpis.lowStockCount}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              &le; 5 units remaining
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Out of Stock
            </p>
            <p className="text-xl sm:text-2xl font-bold text-rose-700">
              {kpis.outOfStockCount}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Needs batch refill
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <XCircle size={18} />
          </div>
        </div>

      </div>

      {/* ── 2. Search & Filter Bar (Fully Mobile Responsive) ─────────────────── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by perfume name, brand, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-2 sm:gap-3">
          
          {/* Gender Filter */}
          <div className="relative flex-1">
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full py-2.5 sm:py-2 pl-3 pr-7 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white text-slate-700 font-medium cursor-pointer appearance-none"
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Fragrance Family Filter */}
          <div className="relative flex-1">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-2.5 sm:py-2 pl-3 pr-7 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 bg-white text-slate-700 font-medium cursor-pointer appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Families' : cat}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Refresh Action */}
          <button
            onClick={fetchProducts}
            className="p-2.5 sm:p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer col-span-2 sm:col-auto flex items-center justify-center"
            title="Refresh Catalog"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── 3. Data Table (Mobile Horizontal Swipe Allowed) ─────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden w-full">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-slate-600" />
            <p className="text-xs font-medium">Loading inventory...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-xs">
            <p>{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-3 px-4 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 font-semibold"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-slate-500 text-xs font-medium">
              No products found matching your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('All');
                setFilterGender('All');
              }}
              className="text-xs font-semibold text-slate-900 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          /* Mobile horizontal scroll container: allows smooth swiping without breaking width */
          <div className="overflow-x-auto w-full scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[700px]">
              {/* Header */}
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Fragrance</th>
                  <th className="py-3.5 px-4">Gender</th>
                  <th className="py-3.5 px-4">Family</th>
                  <th className="py-3.5 px-4">Bottle Variations</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((product) => {
                  const primaryImg =
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200&auto=format&fit=crop&q=80';

                  const totalStock = (product.variations || []).reduce(
                    (acc, v) => acc + (v.stockQuantity || 0),
                    0
                  );

                  const minPrice =
                    product.variations && product.variations.length > 0
                      ? Math.min(...product.variations.map((v) => v.price))
                      : 0;

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Product Name & Thumbnail */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={product.name}
                            className="w-10 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate max-w-[180px]">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {product.brand || 'Mahid Aromas'} &bull; From {formatPKR(minPrice)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Gender Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${
                            product.gender === 'Men'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : product.gender === 'Women'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {product.gender || 'Unisex'}
                        </span>
                      </td>

                      {/* Family */}
                      <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {product.fragranceFamily || 'Haute Extrait'}
                      </td>

                      {/* Bottle Variations */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 min-w-[130px]">
                          {(product.variations || []).map((v) => (
                            <span
                              key={v._id || v.size}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium whitespace-nowrap"
                            >
                              {v.size}ml ({formatPKR(v.price)})
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {totalStock === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Out of Stock
                          </span>
                        ) : totalStock <= 5 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Low ({totalStock} left)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock ({totalStock})
                          </span>
                        )}
                      </td>

                      {/* Actions (Enhanced touch targets p-2.5) */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Product"
                            aria-label="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(product._id, product.name)
                            }
                            className="p-2.5 sm:p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Product"
                            aria-label="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Product Create / Edit Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductForm
            product={editingProduct}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
