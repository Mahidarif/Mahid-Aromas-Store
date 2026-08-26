import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Package, Truck, MapPin, CreditCard,
  Smartphone, ArrowRight, Copy, Check,
} from 'lucide-react';
import { ordersAPI } from '../api/axiosConfig';

const formatPKR = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })
    .format(n).replace('PKR', 'PKR ');

const STATUS_STEPS = ['Processing', 'Ready to Ship', 'Shipped', 'Delivered'];

const PAYMENT_ICONS = {
  Card:    <CreditCard size={15} className="text-blue-400" />,
  JazzCash: <Smartphone size={15} className="text-red-400" />,
  COD:     <Truck size={15} className="text-green-400" />,
};

// ─── Countdown / delivery estimate ───────────────────────────────────────────
function DeliveryEstimate({ city }) {
  const sameDayCities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'];
  const days = sameDayCities.includes(city) ? '1–2' : '2–4';
  const today = new Date();
  const eta   = new Date(today.setDate(today.getDate() + (sameDayCities.includes(city) ? 2 : 4)));
  const label = eta.toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
      <Truck size={15} className="text-blue-400 flex-shrink-0" />
      <p className="text-sm font-sans text-text-secondary">
        Estimated delivery in <span className="text-text-primary font-medium">{days} business days</span>
        {' '}— by <span className="text-blue-300">{label}</span>
      </p>
    </div>
  );
}

// ─── Order status tracker ─────────────────────────────────────────────────────
function StatusTracker({ current }) {
  const idx = STATUS_STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((status, i) => {
        const isDone   = i < idx;
        const isActive = i === idx;
        return (
          <div key={status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                isDone   ? 'border-gold bg-gold'
                : isActive ? 'border-gold bg-gold/10'
                : 'border-white/10 bg-surface-2'
              }`}>
                {isDone
                  ? <Check size={13} className="text-midnight font-bold" />
                  : <span className={`text-[10px] font-bold ${isActive ? 'text-gold' : 'text-text-muted'}`}>{i + 1}</span>}
              </div>
              <span className={`text-[9px] font-sans text-center leading-tight ${
                isDone || isActive ? 'text-text-secondary' : 'text-text-muted'
              }`}>
                {status}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className="flex-1 h-px mb-5 mx-1"
                   style={{ background: i < idx ? '#C9A84C' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Copy-to-clipboard button ─────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-text-muted hover:text-gold transition-colors">
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Main OrderSuccessPage ────────────────────────────────────────────────────
export default function OrderSuccessPage() {
  const { orderId }                = useParams();
  const [searchParams]             = useSearchParams();
  const via                        = searchParams.get('via'); // 'cod' | 'stripe' | 'jazzcash'

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    ordersAPI.getById(orderId)
      .then(({ data }) => { if (!cancelled) setOrder(data.data); })
      .catch((err)     => { if (!cancelled) setError(err.message); })
      .finally(()      => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="font-serif text-xl text-text-primary">Couldn't load order details</p>
        <Link to="/account" className="btn-gold px-6 py-2.5 text-sm">View My Orders</Link>
      </div>
    );
  }

  const shortId = `MA-${order._id.slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Success animation ──────────────────────────────────────── */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.7, bounce: 0.4 }}
            className="inline-flex w-20 h-20 rounded-2xl items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '2px solid rgba(201,168,76,0.3)' }}
          >
            <CheckCircle size={36} className="text-gold" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="font-serif text-3xl font-bold text-text-primary">
              {order.paymentMethod === 'COD'
                ? 'Order Placed!'
                : order.paymentStatus === 'Paid'
                ? 'Payment Confirmed!'
                : 'Order Received!'}
            </h1>
            <p className="text-text-secondary text-base font-sans mt-2">
              {order.paymentMethod === 'COD'
                ? 'Your order has been placed. Pay cash upon delivery.'
                : order.paymentStatus === 'Paid'
                ? 'Your payment was successful. We\'re preparing your fragrance.'
                : 'Your order is being processed. You\'ll receive a confirmation shortly.'}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-5"
        >
          {/* Order ID card */}
          <div className="card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-sans tracking-widest uppercase text-text-muted">Order Reference</p>
              <p className="font-mono text-lg font-bold text-gold mt-0.5">{shortId}</p>
            </div>
            <div className="flex items-center gap-3">
              <CopyButton text={shortId} />
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans border ${
                order.paymentStatus === 'Paid'
                  ? 'bg-green-500/10 border-green-500/25 text-green-400'
                  : order.paymentStatus === 'Pending'
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                  : 'bg-red-500/10 border-red-500/25 text-red-400'
              }`}>
                {PAYMENT_ICONS[order.paymentMethod]}
                {order.paymentStatus}
              </div>
            </div>
          </div>

          {/* Order status tracker */}
          <div className="card p-5 space-y-4">
            <p className="text-[10px] font-sans tracking-widest uppercase text-text-muted flex items-center gap-2">
              <Package size={12} /> Order Status
            </p>
            <StatusTracker current={order.orderStatus} />
          </div>

          {/* Delivery estimate */}
          <DeliveryEstimate city={order.shippingAddress?.city} />

          {/* Shipping address */}
          <div className="card p-5 space-y-2">
            <p className="text-[10px] font-sans tracking-widest uppercase text-text-muted flex items-center gap-2">
              <MapPin size={12} /> Delivering to
            </p>
            <p className="font-sans font-medium text-text-primary">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-text-secondary font-sans">{order.shippingAddress?.phone}</p>
            <p className="text-sm text-text-secondary font-sans">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
            </p>
            <p className="text-sm text-text-secondary font-sans">
              {order.shippingAddress?.city}, {order.shippingAddress?.province}
            </p>
          </div>

          {/* Items summary */}
          <div className="card p-5 space-y-3">
            <p className="text-[10px] font-sans tracking-widest uppercase text-text-muted">Items Ordered</p>
            {order.cartItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-10 h-12 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs">🌸</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm font-semibold text-text-primary line-clamp-1">{item.name}</p>
                  <p className="text-[10px] font-sans text-text-muted">{item.size}ml · Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-sans font-medium text-text-primary flex-shrink-0">
                  {formatPKR(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}

            {/* Price breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-sm font-sans">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">{formatPKR(order.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-sans">
                <span className="text-text-secondary">Shipping</span>
                <span className={order.shippingFee === 0 ? 'text-green-400' : 'text-text-primary'}>
                  {order.shippingFee === 0 ? 'Free' : formatPKR(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/5">
                <span className="font-sans font-semibold text-text-primary">Total Paid</span>
                <span className="font-serif text-lg font-bold text-gold">{formatPKR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/account" className="btn-outline-gold py-3 text-sm">
              My Orders
            </Link>
            <Link to="/products" className="btn-gold py-3 text-sm group">
              Shop More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="text-center text-xs text-text-muted font-sans pb-4">
            Questions? Email us at{' '}
            <a href="mailto:support@mahidaromas.pk" className="text-gold hover:underline">
              support@mahidaromas.pk
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
