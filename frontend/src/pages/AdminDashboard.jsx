import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  FileText,
  RefreshCw,
  Search,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  DollarSign,
  Phone,
  MapPin,
  Calendar,
  Layers,
  X,
  CreditCard,
} from 'lucide-react';
import api, { adminAPI } from '../api/axiosConfig';

const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

const STATUS_CONFIG = {
  Processing: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'Ready to Ship': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  Shipped: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  Delivered: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Cancelled: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── Fetch Orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (statusFilter !== 'ALL') {
        params.orderStatus = statusFilter;
      }

      const res = await adminAPI.getOrders(params);
      setOrders(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Unauthorized: Admin access required.');
      } else {
        setError(err.message || 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─── Status Update Handler ─────────────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`status-${orderId}`]: true }));
      const res = await adminAPI.updateStatus(orderId, { orderStatus: newStatus });

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.data : o))
      );
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`status-${orderId}`]: false }));
    }
  };

  // ─── Filtered Orders Calculation ───────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o._id?.toLowerCase().includes(q) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.phone?.includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q) ||
      o.trackingNumber?.toLowerCase().includes(q)
    );
  });

  // ─── Dashboard Metrics ─────────────────────────────────────────────────────
  const totalRevenue = orders.reduce(
    (sum, o) => (o.isPaid ? sum + (o.totalPrice || 0) : sum),
    0
  );
  const pendingCount = orders.filter((o) => o.orderStatus === 'Processing').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'Ready to Ship').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800 w-full overflow-hidden">
      
      {/* ── Toast Notification ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold text-white ${
              toastMessage.type === 'error' ? 'bg-red-600' : 'bg-slate-900'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Orders &amp; Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer orders, manage shipments, and print packing slips across Pakistan.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* ── 1. KPI Summary Cards Grid (Mobile Responsive 1/2/4 cols) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Paid Revenue
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {formatPKR(totalRevenue)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Confirmed transactions
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Pending Processing */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Processing
            </p>
            <p className="text-xl sm:text-2xl font-bold text-amber-700">
              {pendingCount}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Awaiting packaging
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock size={18} />
          </div>
        </div>

        {/* Ready to Ship */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ready to Ship
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-700">
              {readyCount}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Courier pickup ready
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck size={18} />
          </div>
        </div>

        {/* Completed Delivered */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivered
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700">
              {deliveredCount}
            </p>
            <span className="text-[11px] text-slate-400 font-medium">
              Doorstep completed
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>

      </div>

      {/* ── 2. Search & Status Filter Bar (Mobile Responsive) ────────────────── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by order ID, customer name, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-xs rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-colors bg-white text-slate-900"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Processing', value: 'Processing' },
            { label: 'Ready to Ship', value: 'Ready to Ship' },
            { label: 'Shipped', value: 'Shipped' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Cancelled', value: 'Cancelled' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Orders Data Table (Mobile Horizontal Scrolling) ───────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden w-full">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-slate-600" />
            <p className="text-xs font-medium">Loading orders feed...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-xs">
            <p>{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-3 px-4 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 font-semibold"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-slate-500 text-xs font-medium">
              No orders found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Order Reference</th>
                  <th className="py-3.5 px-4">Customer &amp; Destination</th>
                  <th className="py-3.5 px-4">Flacons Ordered</th>
                  <th className="py-3.5 px-4">Payment &amp; Amount</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => {
                  const statusInfo =
                    STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Processing;
                  const dateStr = new Date(order.createdAt).toLocaleDateString(
                    'en-PK',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }
                  );

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Order Ref & Date */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-900 text-xs block">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar size={11} /> {dateStr}
                          </span>
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 text-xs">
                            {order.shippingAddress?.fullName || 'Guest Customer'}
                          </p>
                          <a
                            href={`tel:${order.shippingAddress?.phone}`}
                            className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1"
                          >
                            <Phone size={11} className="text-slate-400" />
                            <span>{order.shippingAddress?.phone}</span>
                          </a>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" />
                            <span>
                              {order.shippingAddress?.city}, {order.shippingAddress?.province}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Items Ordered */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 min-w-[140px]">
                          {(order.cartItems || []).map((item, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] text-slate-700 flex items-center gap-1.5"
                            >
                              <span className="w-4 h-4 rounded bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                {item.quantity}
                              </span>
                              <span className="font-medium truncate max-w-[130px]">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Payment Method & Total */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-sm">
                            {formatPKR(order.totalPrice)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                              order.paymentMethod === 'COD'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}
                          >
                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Status Update Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <div className="relative">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={actionLoading[`status-${order._id}`]}
                              className={`py-1.5 pl-2.5 pr-7 rounded-lg text-xs font-bold border appearance-none cursor-pointer ${statusInfo.badge}`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Ready to Ship">Ready to Ship</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown
                              size={12}
                              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                            />
                          </div>

                          {order.trackingNumber && (
                            <p className="text-[10px] font-mono text-slate-500">
                              Trk: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions (Packing Slip) with generous touch padding */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrderForSlip(order)}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Generate Packing Slip"
                        >
                          <FileText size={14} />
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Packing Slip Modal (Mobile Viewport Optimized) ─────────────────── */}
      <AnimatePresence>
        {selectedOrderForSlip && (
          <div className="fixed inset-0 z-50 p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-5 text-slate-800 font-sans max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Fulfillment Packing Slip
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Order #{selectedOrderForSlip._id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrderForSlip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Delivery info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  {selectedOrderForSlip.shippingAddress?.fullName}
                </p>
                <p className="text-slate-600">
                  {selectedOrderForSlip.shippingAddress?.phone}
                </p>
                <p className="text-slate-600">
                  {selectedOrderForSlip.shippingAddress?.addressLine1}
                </p>
                <p className="text-slate-600">
                  {selectedOrderForSlip.shippingAddress?.city},{' '}
                  {selectedOrderForSlip.shippingAddress?.province}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                {selectedOrderForSlip.cartItems?.map((item, i) => (
                  <div key={i} className="pt-2 flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono text-slate-600">
                      {formatPKR(item.price || 0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 font-bold text-sm">
                <span>Total Due on Delivery (COD)</span>
                <span className="text-slate-900">
                  {formatPKR(selectedOrderForSlip.totalPrice)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="btn-gold flex-1 py-3 rounded-xl text-xs font-bold"
                >
                  Print Packing Slip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
