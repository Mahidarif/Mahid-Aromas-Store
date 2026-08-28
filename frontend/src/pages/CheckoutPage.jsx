import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  ArrowRight,
  Loader2,
  MapPin,
  User,
  Phone,
  Lock,
  ChevronLeft,
  Sparkles,
  Package,
  Award,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../api/axiosConfig';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import SEO from '../components/SEO';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Abbottabad',
  'Other',
];

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Kashmir',
];

const PAYMENT_METHODS = [
  {
    id: 'COD',
    name: 'Cash on Delivery (COD)',
    badge: 'Popular Nationwide',
    tagColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    icon: Truck,
    description:
      'Pay safely when your package arrives at your doorstep. Open flacon packaging inspection allowed with the courier.',
    highlight: 'No advance payment needed &bull; Pay with cash',
  },
  {
    id: 'Card',
    name: 'Debit / Credit Card',
    badge: 'Visa & Mastercard',
    tagColor: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    icon: CreditCard,
    description:
      'Secure end-to-end 256-bit encrypted card processing powered by Stripe.',
    highlight: 'Zero extra processing fees',
  },
  {
    id: 'JazzCash',
    name: 'JazzCash / EasyPaisa',
    badge: 'Mobile Account',
    tagColor: 'bg-red-950/80 text-red-300 border-red-500/40',
    icon: Smartphone,
    description:
      'Instant direct mobile wallet deduction. You will receive an OTP prompt to confirm.',
    highlight: 'Instant automated verification',
  },
];

// ─── Inline Stripe Form ────────────────────────────────────────────────────────
function StripePaymentForm({ orderId, totalAmount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${orderId}?via=stripe`,
        },
      });

      if (error) {
        onError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err.message || 'Payment authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-white/10">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="btn-gold w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <Lock size={14} />
            <span>Pay {formatPKR(totalAmount)} with Card</span>
          </>
        )}
      </button>
    </form>
  );
}

// ─── Main Two-Column Luxury Checkout Page ───────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, shippingFee, clearCart } = useCart();

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('ma_token')) {
      navigate('/login?redirect=/checkout');
    }
  }, [navigate]);

  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '',
    country: 'Pakistan',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Stripe inline flow states
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [stripeOrderId, setStripeOrderId] = useState(null);

  const effectiveShippingFee = cartTotal >= 5000 ? 0 : (shippingFee || 250);
  const orderFinalTotal = cartTotal + effectiveShippingFee;

  const handleChange = (field, val) => {
    setShipping((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!shipping.fullName.trim()) errs.fullName = 'Full recipient name is required.';
    if (!shipping.phone.trim()) {
      errs.phone = 'Phone number is required for courier delivery.';
    } else if (!/^03[0-9]{9}$/.test(shipping.phone.replace(/[-\s]/g, ''))) {
      errs.phone = 'Enter a valid 11-digit Pakistani phone (e.g., 03001234567).';
    }
    if (!shipping.addressLine1.trim()) {
      errs.addressLine1 = 'House, street & sector address is required.';
    }
    if (!shipping.city) errs.city = 'Please select your destination city.';
    if (!shipping.province) errs.province = 'Please select your province.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const orderPayload = {
        cartItems: cartItems.map((item) => ({
          product: item.product._id,
          variationId: item.variation._id,
          name: item.product.name,
          quantity: item.quantity,
        })),
        shippingAddress: shipping,
        paymentMethod: paymentMethod === 'Card' ? 'Stripe' : paymentMethod,
      };

      const { data: orderRes } = await ordersAPI.create(orderPayload);
      const createdOrder = orderRes.data;

      if (paymentMethod === 'COD') {
        clearCart();
        navigate(`/order-success/${createdOrder._id}?via=cod`);
      } else if (paymentMethod === 'Card') {
        const { data: intentRes } = await ordersAPI.stripeIntent({
          orderId: createdOrder._id,
        });
        setStripeOrderId(createdOrder._id);
        setStripeClientSecret(intentRes.clientSecret);
      } else if (paymentMethod === 'JazzCash') {
        const { data: jcRes } = await ordersAPI.jazzCashInitiate({
          orderId: createdOrder._id,
          mobileNumber: shipping.phone,
        });

        const { postUrl, params } = jcRes.data || jcRes;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = postUrl;
        Object.entries(params).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = val;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.message ||
          'Unable to complete order placement. Please review your details.'
      );
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !stripeClientSecret) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-charcoal text-text-primary space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-2xl">
          🌸
        </div>
        <h2 className="font-serif text-2xl font-bold">Your Bag is Empty</h2>
        <p className="text-xs font-sans text-text-muted max-w-sm">
          Please add your signature fragrances before proceeding to checkout.
        </p>
        <Link to="/collections" className="btn-gold text-xs px-6 py-2.5 rounded-xl mt-1 font-bold">
          Discover Fragrances
        </Link>
      </div>
    );
  }

  const stripeOptions = stripeClientSecret
    ? {
        clientSecret: stripeClientSecret,
        appearance: {
          theme: 'night',
          variables: { colorPrimary: '#9B7A2A', colorBackground: '#131A29' },
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-charcoal text-text-primary py-8 sm:py-14">
      <SEO
        title="Secure Luxury Checkout — Mahid Aromas"
        description="Complete your order for artisanal extraits de parfum. Cash on Delivery available nationwide across Pakistan."
      />

      {/* Constrained max-width container for balanced wide-screen viewing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Reassurance Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-white/8">
          <div>
            <Link
              to="/collections"
              className="inline-flex items-center gap-1 text-xs font-sans text-text-muted hover:text-gold transition-colors mb-1"
            >
              <ChevronLeft size={14} /> Return to Fragrances
            </Link>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-text-primary">
              Maison Checkout
            </h1>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2/80 border border-white/10 text-xs font-sans text-text-secondary shadow-xs">
            <Lock size={13} className="text-gold" />
            <span>256-Bit Encrypted &bull; Guaranteed Authentic</span>
          </div>
        </div>

        {/* ── Two-Column Layout (Left Form, Right Sticky Summary) ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 pt-8 sm:pt-10 items-start">
          
          {/* ── LEFT COLUMN: Shipping & Payment Form (7 Cols) ───────────────── */}
          <div className="lg:col-span-7 space-y-7 sm:space-y-8">
            
            {apiError && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-sans">
                {apiError}
              </div>
            )}

            {/* ── 1. Delivery Destination Section ──────────────────────────── */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-2/40 border border-white/8 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <div className="w-7 h-7 rounded-lg bg-gold/15 text-gold flex items-center justify-center font-bold text-xs border border-gold/30">
                  1
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                  Delivery Address &amp; Recipient
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-text-muted font-bold block">
                    Recipient Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mahmood"
                      value={shipping.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="input-luxury pl-10 py-3 text-base w-full bg-surface-2/80 rounded-xl"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-400 font-sans">{errors.fullName}</p>
                  )}
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-text-muted font-bold block">
                    Mobile Phone (For Courier Updates &amp; Tracking) *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="0300 1234567"
                      value={shipping.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="input-luxury pl-10 py-3 text-base w-full bg-surface-2/80 rounded-xl"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-400 font-sans">{errors.phone}</p>
                  )}
                </div>

                {/* Street Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-text-muted font-bold block">
                    Street Address &amp; House / Sector *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="House # 12, Street 4, Sector F-7/2"
                      value={shipping.addressLine1}
                      onChange={(e) => handleChange('addressLine1', e.target.value)}
                      className="input-luxury pl-10 py-3 text-base w-full bg-surface-2/80 rounded-xl"
                    />
                  </div>
                  {errors.addressLine1 && (
                    <p className="text-xs text-red-400 font-sans">{errors.addressLine1}</p>
                  )}
                </div>

                {/* City Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-widest text-text-muted font-bold block">
                    City *
                  </label>
                  <select
                    value={shipping.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="input-luxury py-3 px-3.5 text-base w-full bg-surface-2/80 rounded-xl cursor-pointer"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Province Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-sans uppercase tracking-widest text-text-muted font-bold block">
                    Province *
                  </label>
                  <select
                    value={shipping.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="input-luxury py-3 px-3.5 text-base w-full bg-surface-2/80 rounded-xl cursor-pointer"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── 2. Payment Method Interactive Cards ─────────────────────── */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-2/40 border border-white/8 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <div className="w-7 h-7 rounded-lg bg-gold/15 text-gold flex items-center justify-center font-bold text-xs border border-gold/30">
                  2
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                  Payment Preference
                </h2>
              </div>

              <div className="space-y-3.5">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  const Icon = pm.icon;

                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? 'bg-gold/10 border-gold ring-1 ring-gold shadow-gold-sm'
                          : 'bg-surface-2/60 border-white/8 hover:border-gold/30 hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Radio Circle */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 transition-colors ${
                            isSelected ? 'border-gold bg-gold' : 'border-white/30'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-midnight" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <Icon size={18} className={isSelected ? 'text-gold' : 'text-text-muted'} />
                              <span className="font-serif font-bold text-base sm:text-lg text-text-primary">
                                {pm.name}
                              </span>
                            </div>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider border ${pm.tagColor}`}
                            >
                              {pm.badge}
                            </span>
                          </div>

                          <p className="text-xs font-sans text-text-secondary leading-relaxed">
                            {pm.description}
                          </p>

                          {pm.highlight && (
                            <p className="text-[11px] font-sans text-gold/90 font-medium">
                              {pm.highlight}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Stripe Payment Form */}
              {stripeClientSecret && stripePromise && (
                <div className="p-5 rounded-2xl bg-midnight border border-gold/30 mt-4">
                  <h3 className="font-serif text-base font-bold text-gold mb-2">
                    Card Authentication
                  </h3>
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <StripePaymentForm
                      orderId={stripeOrderId}
                      totalAmount={orderFinalTotal}
                      onSuccess={() => {
                        clearCart();
                        navigate(`/order-success/${stripeOrderId}?via=stripe`);
                      }}
                      onError={(err) => setApiError(err)}
                    />
                  </Elements>
                </div>
              )}
            </div>

            {/* Place Order Primary Action */}
            {!stripeClientSecret && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="btn-gold w-full py-4 sm:py-5 rounded-2xl font-sans font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-gold group cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-midnight" />
                      <span>Confirming Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>
                        Place Order &bull; {formatPKR(orderFinalTotal)}
                      </span>
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <p className="text-center text-xs font-sans text-text-muted">
                  By confirming, you agree to our authentic extrait delivery terms.
                </p>
              </div>
            )}

          </div>

          {/* ── RIGHT COLUMN: Sticky Order Summary Anchor (5 Cols) ───────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5 sm:space-y-6">
            
            {/* Order Items & Pricing Card */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-surface-2/60 border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                  Order Summary
                </h3>
                <span className="text-xs font-sans text-gold font-bold">
                  {cartItems.length} {cartItems.length === 1 ? 'flacon' : 'flacons'}
                </span>
              </div>

              {/* Items List (Scrollable if many items) */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-white/5 scrollbar-none">
                {cartItems.map((item) => {
                  const { product, variation, quantity } = item;
                  const img =
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&auto=format&fit=crop&q=80';

                  return (
                    <div
                      key={`${product._id}-${variation._id}`}
                      className="pt-3 first:pt-0 flex items-center gap-3.5"
                    >
                      <div className="w-14 aspect-[3/4] rounded-xl overflow-hidden bg-midnight border border-white/10 flex-shrink-0">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-text-primary truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs font-sans text-text-muted mt-0.5">
                          <span>{variation.size} ml</span>
                          <span>&bull;</span>
                          <span>Qty: {quantity}</span>
                        </div>
                      </div>

                      <span className="font-serif font-bold text-xs sm:text-sm text-gold flex-shrink-0">
                        {formatPKR(variation.price * quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="pt-3 border-t border-white/8 space-y-2.5 text-xs font-sans">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="text-text-primary font-medium">
                    {formatPKR(cartTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-text-muted">
                  <span>Nationwide Express Courier</span>
                  <span>
                    {effectiveShippingFee === 0 ? (
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                        Free Delivery
                      </span>
                    ) : (
                      formatPKR(effectiveShippingFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-baseline justify-between">
                  <span className="font-serif text-sm sm:text-base font-bold text-text-primary">
                    Total Amount
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-gold">
                    {formatPKR(orderFinalTotal)}
                  </span>
                </div>
              </div>

            </div>

            {/* Maison Trust & Reassurance Card */}
            <div className="p-5 rounded-2xl sm:rounded-3xl bg-midnight/80 border border-gold/20 space-y-3.5">
              <h4 className="text-xs font-sans uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-1.5">
                <Sparkles size={13} /> The Mahid Aromas Commitment
              </h4>

              <div className="space-y-2.5 text-xs font-sans text-text-secondary">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Authentic Haute Parfumerie:</strong> Pure 30%+ oil extraits.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Truck size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Express Dispatch:</strong> Dispatched via TCS / Trax in 24-48 hours.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Award size={16} className="text-gold flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Doorstep Inspection:</strong> Check package exterior before paying COD.
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
