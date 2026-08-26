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
} from 'lucide-react';
import api, { adminAPI } from '../api/axiosConfig';

const formatPKR = (amount) =>
  `PKR ${Number(amount || 0).toLocaleString('en-PK')}`;

const STATUS_CONFIG = {
  Processing: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  'Ready to Ship': {
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  Shipped: {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
  },
  Delivered: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  Cancelled: {
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
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

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`status-${orderId}`]: true }));
      const res = await adminAPI.updateStatus(orderId, { orderStatus: newStatus });

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.data : o))
      );
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`status-${orderId}`]: false }));
    }
  };

  const handleGenerateAWB = async (orderId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`awb-${orderId}`]: true }));
      const res = await adminAPI.generateAWB(orderId);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.data : o))
      );
      showToast(`AWB Generated: ${res.data.data.courierTrackingNumber}`);
    } catch (err) {
      showToast(err.message || 'Failed to generate AWB', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`awb-${orderId}`]: false }));
    }
  };

  const handleDownloadInvoice = async (orderId, orderRef) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`inv-${orderId}`]: true }));
      const response = await api.get(`/admin/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });

      // Create blob link to trigger browser download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || 'Failed to generate invoice PDF', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`inv-${orderId}`]: false }));
    }
  };

  // ─── Filter & Search ────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const orderRef = `MA-${order._id.slice(-8).toUpperCase()}`.toLowerCase();
    const customer = order.shippingAddress?.fullName?.toLowerCase() || '';
    const phone = order.shippingAddress?.phone?.toLowerCase() || '';
    const tracking = order.courierTrackingNumber?.toLowerCase() || '';

    return (
      orderRef.includes(query) ||
      customer.includes(query) ||
      phone.includes(query) ||
      tracking.includes(query)
    );
  });

  // ─── Stats Calculation ──────────────────────────────────────────────────────
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const processingCount = orders.filter((o) => o.orderStatus === 'Processing').length;
  const readyToShipCount = orders.filter((o) => o.orderStatus === 'Ready to Ship').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert size={32} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-text-primary">{error}</h2>
        <p className="text-text-muted text-sm font-sans max-w-md">
          You must be logged into an administrator account to access logistics and fulfillment controls.
        </p>
        <Link to="/login" className="btn-gold text-sm px-6 py-2.5 mt-2">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Toast Notification ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border flex items-center gap-2.5 shadow-2xl ${
              toastMessage.type === 'error'
                ? 'bg-red-500/15 border-red-500/30 text-red-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span className="text-sm font-sans font-medium">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dashboard Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-gold text-xs font-sans tracking-widest uppercase flex items-center gap-1.5 mb-1">
            <Package size={13} /> Logistics & Fulfillment
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-primary">
            Admin Order Portal
          </h1>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="btn-outline-gold text-xs px-4 py-2 rounded-xl flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Orders
        </button>
      </div>

      {/* ── KPI Analytics Summary ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">Total Revenue</span>
            <DollarSign size={16} className="text-gold" />
          </div>
          <p className="font-serif text-2xl font-bold text-text-primary">{formatPKR(totalRevenue)}</p>
          <p className="text-[11px] text-text-muted font-sans mt-1">From confirmed payments</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">Processing</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-400">{processingCount}</p>
          <p className="text-[11px] text-text-muted font-sans mt-1">Requires AWB dispatch</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">Ready to Ship</span>
            <Truck size={16} className="text-blue-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-blue-400">{readyToShipCount}</p>
          <p className="text-[11px] text-text-muted font-sans mt-1">AWB booked with courier</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-sans uppercase tracking-wider">Delivered</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-400">{deliveredCount}</p>
          <p className="text-[11px] text-text-muted font-sans mt-1">Completed orders</p>
        </div>
      </div>

      {/* ── Filter Bar & Search ──────────────────────────────────────────────── */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {['ALL', 'Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-gold text-midnight font-semibold shadow-gold-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search Ref, Customer, Tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-luxury text-xs pl-8 py-2 rounded-lg w-full"
          />
        </div>
      </div>

      {/* ── Order Table ──────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-surface-2 text-text-muted text-[11px] font-sans uppercase tracking-wider">
                <th className="py-3.5 px-4 font-medium">Order Ref</th>
                <th className="py-3.5 px-4 font-medium">Customer & Address</th>
                <th className="py-3.5 px-4 font-medium">Items</th>
                <th className="py-3.5 px-4 font-medium">Total & Payment</th>
                <th className="py-3.5 px-4 font-medium">Order Status</th>
                <th className="py-3.5 px-4 font-medium">Logistics & AWB</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-sm font-sans">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-muted">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-gold" />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-muted">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderRef = `MA-${order._id.slice(-8).toUpperCase()}`;
                  const isUpdatingStatus = actionLoading[`status-${order._id}`];
                  const isGeneratingAWB = actionLoading[`awb-${order._id}`];
                  const isDownloadingInv = actionLoading[`inv-${order._id}`];
                  const statusStyle = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Processing;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-surface-2/40 transition-colors duration-150"
                    >
                      {/* 1. Order Ref & Date */}
                      <td className="py-4 px-4 align-top">
                        <span className="font-mono font-semibold text-gold text-xs block">
                          {orderRef}
                        </span>
                        <span className="text-[11px] text-text-muted block mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* 2. Customer & Address */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-text-primary text-xs">
                          {order.shippingAddress?.fullName || 'N/A'}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {order.shippingAddress?.phone}
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5 line-clamp-1 max-w-[200px]" title={`${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.city}`}>
                          {order.shippingAddress?.city}, {order.shippingAddress?.province}
                        </div>
                      </td>

                      {/* 3. Items Ordered */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1 max-w-[180px]">
                          {order.cartItems.map((item, idx) => (
                            <div key={idx} className="text-[11px] text-text-secondary line-clamp-1">
                              <span className="text-text-primary font-medium">{item.quantity}x</span>{' '}
                              {item.name} ({item.size}ml)
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* 4. Total & Payment */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-text-primary text-xs">
                          {formatPKR(order.totalAmount)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-white/8 text-text-secondary">
                            {order.paymentMethod}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              order.paymentStatus === 'Paid'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* 5. Order Status (Interactive Dropdown) */}
                      <td className="py-4 px-4 align-top">
                        <div className="relative inline-block">
                          <select
                            disabled={isUpdatingStatus}
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`text-[11px] font-medium rounded-lg px-2.5 py-1.5 border appearance-none pr-7 cursor-pointer transition-all bg-surface-2 ${statusStyle.badge}`}
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
                      </td>

                      {/* 6. Logistics & AWB */}
                      <td className="py-4 px-4 align-top">
                        {order.courierTrackingNumber ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-gold">
                                {order.courierTrackingNumber}
                              </span>
                              {order.awbUrl && (
                                <a
                                  href={order.awbUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-text-muted hover:text-gold transition-colors"
                                  title="Track on Courier Portal"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted block mt-0.5">
                              Courier: {order.courierName || 'Trax Logistics'}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateAWB(order._id)}
                            disabled={isGeneratingAWB}
                            className="btn-gold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 shadow-none"
                          >
                            {isGeneratingAWB ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Truck size={12} />
                            )}
                            Generate AWB
                          </button>
                        )}
                      </td>

                      {/* 7. Action: PDF Invoice */}
                      <td className="py-4 px-4 align-top text-right">
                        <button
                          onClick={() => handleDownloadInvoice(order._id, orderRef)}
                          disabled={isDownloadingInv}
                          className="btn-ghost border border-white/10 text-xs px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-text-secondary hover:text-gold hover:border-gold/30 disabled:opacity-50"
                          title="Download PDF Invoice"
                        >
                          {isDownloadingInv ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <FileText size={13} />
                          )}
                          Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
