import { useState, useEffect } from 'react';
import { useNavigate, Link }   from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, ChevronRight, ChevronLeft, CreditCard,
  Smartphone, Truck, ShieldCheck, ArrowRight, Loader2,
  MapPin, User, Phone, Lock,
} from 'lucide-react';
import { useCart }   from '../context/CartContext';
import { ordersAPI } from '../api/axiosConfig';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, PaymentElement,
  useStripe, useElements,
} from '@stripe/react-stripe-js';

// ── Stripe instance (lazy-loaded) ──────────────────────────────────────────────
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const formatPKR = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })
    .format(n).replace('PKR', 'PKR ');

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot',
  'Bahawalpur', 'Sargodha', 'Hyderabad', 'Sukkur', 'Other',
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  const steps = ['Shipping', 'Payment', 'Review'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const num      = i + 1;
        const isActive = step === num;
        const isDone   = step > num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale:           isActive ? 1.1 : 1,
                  backgroundColor: isDone   ? '#C9A84C' : isActive ? '#1A2035' : '#12182B',
                  borderColor:     isDone || isActive ? '#C9A84C' : 'rgba(255,255,255,0.1)',
                }}
                transition={{ duration: 0.3 }}
                className="w-9 h-9 rounded-full flex items-center justify-center border-2"
              >
                {isDone ? (
                  <CheckCircle size={16} className="text-midnight" />
                ) : (
                  <span className={`text-xs font-sans font-bold ${isActive ? 'text-gold' : 'text-text-muted'}`}>
                    {num}
                  </span>
                )}
              </motion.div>
              <span className={`text-[10px] font-sans tracking-wide ${isActive ? 'text-gold' : isDone ? 'text-text-secondary' : 'text-text-muted'}`}>
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="w-16 sm:w-24 h-px mx-2 mb-5"
                   style={{ background: step > num + 1 || (step > num)
                     ? 'linear-gradient(to right, #C9A84C, rgba(201,168,76,0.4))'
                     : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-sans font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
    </div>
  );
}

// ─── STEP 1: Shipping Details ─────────────────────────────────────────────────
function ShippingStep({ data, onChange, onNext, errors }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-primary">Shipping Details</h2>
        <p className="text-text-muted text-sm font-sans mt-1">We'll deliver to this address via TCS, Leopards, or Trax.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *" error={errors.fullName}>
          <div className="relative">
            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="input-luxury pl-9" placeholder="Muhammad Ali"
              value={data.fullName} onChange={(e) => onChange('fullName', e.target.value)} />
          </div>
        </Field>

        <Field label="Phone Number *" error={errors.phone}>
          <div className="relative">
            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="input-luxury pl-9" placeholder="03001234567" type="tel"
              value={data.phone} onChange={(e) => onChange('phone', e.target.value)} />
          </div>
        </Field>

        <Field label="Address Line 1 *" error={errors.addressLine1}>
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input className="input-luxury pl-9" placeholder="House #, Street, Block"
              value={data.addressLine1} onChange={(e) => onChange('addressLine1', e.target.value)} />
          </div>
        </Field>

        <Field label="Address Line 2">
          <input className="input-luxury" placeholder="Apartment, Suite, Landmark (optional)"
            value={data.addressLine2} onChange={(e) => onChange('addressLine2', e.target.value)} />
        </Field>

        <Field label="City *" error={errors.city}>
          <select className="input-luxury bg-surface-2" value={data.city}
            onChange={(e) => onChange('city', e.target.value)}>
            <option value="">Select city…</option>
            {PAKISTAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Province *" error={errors.province}>
          <select className="input-luxury bg-surface-2" value={data.province}
            onChange={(e) => onChange('province', e.target.value)}>
            <option value="">Select province…</option>
            {['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'AJK'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Postal Code">
          <input className="input-luxury" placeholder="54000"
            value={data.postalCode} onChange={(e) => onChange('postalCode', e.target.value)} />
        </Field>
      </div>

      <div className="flex items-start gap-2 mt-2">
        <ShieldCheck size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-muted font-sans">
          Your information is encrypted and never shared with third parties.
        </p>
      </div>

      <button onClick={onNext} className="btn-gold w-full py-3.5 text-sm mt-4 group">
        Continue to Payment
        <ChevronRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
}

// ─── STEP 2: Payment Method Selection ────────────────────────────────────────
const PAYMENT_OPTIONS = [
  {
    id:      'Card',
    label:   'Credit / Debit Card',
    icon:    <CreditCard size={20} className="text-blue-400" />,
    badge:   'Visa · Mastercard',
    detail:  'Secure card payment powered by Stripe. Your card details are encrypted end-to-end and never stored on our servers.',
    secure:  true,
  },
  {
    id:      'JazzCash',
    label:   'JazzCash Mobile Wallet',
    icon:    <Smartphone size={20} className="text-red-400" />,
    badge:   'Pakistan\'s #1 Wallet',
    detail:  'Pay instantly from your JazzCash account. You\'ll be redirected to the JazzCash portal to complete payment.',
    secure:  true,
  },
  {
    id:      'COD',
    label:   'Cash on Delivery',
    icon:    <Truck size={20} className="text-green-400" />,
    badge:   'Pay at your door',
    detail:  'Pay cash when your order arrives. Available across Pakistan. COD charge: Free.',
    secure:  false,
  },
];

function PaymentStep({ selected, onSelect, onNext, onBack }) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-primary">Payment Method</h2>
        <p className="text-text-muted text-sm font-sans mt-1">Choose how you'd like to pay.</p>
      </div>

      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
              selected === opt.id
                ? 'border-gold bg-gold/5 shadow-gold-sm'
                : 'border-white/8 bg-surface hover:border-gold/30'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Radio */}
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                selected === opt.id ? 'border-gold' : 'border-white/20'
              }`}>
                {selected === opt.id && (
                  <motion.div
                    layoutId="radio-fill"
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: '#C9A84C' }}
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {opt.icon}
                  <span className="font-sans font-semibold text-text-primary">{opt.label}</span>
                  <span className="ml-auto text-[10px] font-sans px-2 py-0.5 rounded-full bg-surface-2 border border-white/8 text-text-muted">
                    {opt.badge}
                  </span>
                </div>

                <AnimatePresence>
                  {selected === opt.id && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs text-text-secondary font-sans mt-2.5 leading-relaxed overflow-hidden"
                    >
                      {opt.detail}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface border border-white/5">
        <Lock size={13} className="text-green-400 flex-shrink-0" />
        <p className="text-xs font-sans text-text-muted">All transactions are secured with 256-bit SSL encryption.</p>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={onBack} className="btn-ghost border border-white/10 px-5 py-3 rounded-xl text-sm flex-shrink-0">
          <ChevronLeft size={15} /> Back
        </button>
        <button onClick={onNext} disabled={!selected} className="btn-gold flex-1 py-3 text-sm group disabled:opacity-50 disabled:cursor-not-allowed">
          Review Order <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Stripe Payment Form (rendered inside <Elements>) ─────────────────────────
function StripePaymentForm({ orderId, onSuccess, onError }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${orderId}?via=stripe`,
        },
      });
      if (error) onError(error.message);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-gold w-full py-3.5 text-sm disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Pay {/* amount injected by parent */}</>}
        {!loading && <ArrowRight size={15} />}
      </button>
    </form>
  );
}

// ─── STEP 3: Order Review & Place Order ───────────────────────────────────────
function ReviewStep({ cartItems, cartTotal, shippingFee, paymentMethod, shippingData, onBack, onPlaceOrder, isPlacing }) {
  const total = cartTotal + shippingFee;
  const [agreed, setAgreed] = useState(false);

  const btnLabel = {
    Card:     `Pay ${formatPKR(total)} with Card`,
    JazzCash: `Pay ${formatPKR(total)} with JazzCash`,
    COD:      'Place Order (Pay on Delivery)',
  }[paymentMethod];

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-primary">Review Your Order</h2>
        <p className="text-text-muted text-sm font-sans mt-1">Please confirm everything before placing.</p>
      </div>

      {/* Shipping summary */}
      <div className="glass rounded-2xl p-4 space-y-1">
        <p className="text-xs font-sans tracking-widest uppercase text-text-muted mb-2">Delivering to</p>
        <p className="font-sans text-sm font-medium text-text-primary">{shippingData.fullName}</p>
        <p className="text-sm text-text-secondary font-sans">{shippingData.phone}</p>
        <p className="text-sm text-text-secondary font-sans">
          {shippingData.addressLine1}{shippingData.addressLine2 ? `, ${shippingData.addressLine2}` : ''}
        </p>
        <p className="text-sm text-text-secondary font-sans">{shippingData.city}, {shippingData.province}</p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.variation._id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="w-12 h-14 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0">
              {item.product.images?.[0]
                ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-sm">🌸</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-sm font-semibold text-text-primary line-clamp-1">{item.product.name}</p>
              <p className="text-[10px] font-sans text-text-muted mt-0.5">
                {item.variation.size}ml · {item.variation.concentration.split(' ')[0]} · Qty: {item.quantity}
              </p>
            </div>
            <p className="font-sans text-sm font-medium text-text-primary flex-shrink-0">
              {formatPKR(item.variation.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Price summary */}
      <div className="glass rounded-2xl p-4 space-y-2.5">
        <div className="flex justify-between text-sm font-sans">
          <span className="text-text-secondary">Subtotal</span>
          <span className="text-text-primary">{formatPKR(cartTotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-sans">
          <span className="text-text-secondary">Shipping</span>
          <span className={shippingFee === 0 ? 'text-green-400' : 'text-text-primary'}>
            {shippingFee === 0 ? 'Free' : formatPKR(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-white/8">
          <span className="font-sans font-semibold text-text-primary">Total</span>
          <span className="font-serif text-xl font-bold text-text-primary">{formatPKR(total)}</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <div className="w-4 h-4 rounded-md flex items-center justify-center text-[10px]"
               style={{ background: { Card: '#3B82F6', JazzCash: '#EF4444', COD: '#22C55E' }[paymentMethod] + '30' }}>
            {{ Card: '💳', JazzCash: '📱', COD: '🚚' }[paymentMethod]}
          </div>
          <span className="text-xs text-text-muted font-sans">
            Payment: <span className="text-text-secondary">{{ Card: 'Credit/Debit Card', JazzCash: 'JazzCash Wallet', COD: 'Cash on Delivery' }[paymentMethod]}</span>
          </span>
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-amber-500 cursor-pointer flex-shrink-0" />
        <span className="text-xs text-text-muted font-sans leading-relaxed">
          I agree to the{' '}
          <Link to="/terms" className="text-gold hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
          {' '}I understand this is a binding order.
        </span>
      </label>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-ghost border border-white/10 px-5 py-3 rounded-xl text-sm flex-shrink-0">
          <ChevronLeft size={15} /> Back
        </button>
        <button
          onClick={onPlaceOrder}
          disabled={!agreed || isPlacing}
          className="btn-gold flex-1 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlacing
            ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
            : <>{btnLabel} <ArrowRight size={15} /></>}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main CheckoutPage ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, shippingFee, clearCart } = useCart();

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (!localStorage.getItem('ma_token')) {
      navigate('/login?redirect=/checkout');
    }
  }, [navigate]);

  const [step,          setStep]          = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPlacing,     setIsPlacing]     = useState(false);
  const [apiError,      setApiError]      = useState('');

  // Stripe inline payment state
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [stripeOrderId,      setStripeOrderId]      = useState(null);

  const [shipping, setShipping] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', province: '', postalCode: '', country: 'Pakistan',
  });
  const [shippingErrors, setShippingErrors] = useState({});

  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (shippingErrors[field]) setShippingErrors((e) => ({ ...e, [field]: '' }));
  };

  // Shipping validation
  const validateShipping = () => {
    const errs = {};
    if (!shipping.fullName.trim())     errs.fullName    = 'Required';
    if (!/^03[0-9]{9}$/.test(shipping.phone)) errs.phone = 'Enter valid Pakistani number (03XXXXXXXXX)';
    if (!shipping.addressLine1.trim()) errs.addressLine1 = 'Required';
    if (!shipping.city)                errs.city        = 'Select a city';
    if (!shipping.province)            errs.province    = 'Select a province';
    setShippingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingNext = () => {
    if (validateShipping()) setStep(2);
  };

  // Build the order payload for backend
  const buildOrderPayload = () => ({
    cartItems: cartItems.map((item) => ({
      product:     item.product._id,
      variationId: item.variation._id,
      name:        item.product.name,
      quantity:    item.quantity,
    })),
    shippingAddress: shipping,
    paymentMethod,
  });

  // Place order handler (dispatches per payment method)
  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    setApiError('');

    try {
      // 1. Create the core order on backend
      const { data: orderRes } = await ordersAPI.create(buildOrderPayload());
      const order = orderRes.data;

      if (paymentMethod === 'COD') {
        // COD — no further payment step needed
        clearCart();
        navigate(`/order-success/${order._id}?via=cod`);

      } else if (paymentMethod === 'Stripe') {
        // Stripe — create PaymentIntent, then show Stripe Elements inline
        const { data: intentRes } = await ordersAPI.stripeIntent({ orderId: order._id });
        setStripeOrderId(order._id);
        setStripeClientSecret(intentRes.clientSecret);
        // Stripe Elements form will now render in place of the Review step

      } else if (paymentMethod === 'JazzCash') {
        // JazzCash — get signed payload, then POST to JazzCash via hidden form
        const { data: jcRes } = await ordersAPI.jazzCashInitiate({ orderId: order._id, mobileNumber: shipping.phone });

        const { postUrl, params } = jcRes.data || jcRes;

        // Create hidden form and auto-submit (browser redirect to JazzCash portal)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = postUrl;
        Object.entries(params).forEach(([key, val]) => {
          const input   = document.createElement('input');
          input.type    = 'hidden';
          input.name    = key;
          input.value   = val;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
      setIsPlacing(false);
    }
  };

  // Empty cart guard
  if (cartItems.length === 0 && !stripeClientSecret) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <p className="font-serif text-2xl text-text-primary">Your bag is empty</p>
        <Link to="/products" className="btn-gold px-8 py-3">Browse Fragrances</Link>
      </div>
    );
  }

  const stripeOptions = stripeClientSecret
    ? { clientSecret: stripeClientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#C9A84C' } } }
    : null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Logo link */}
        <Link to="/" className="flex justify-center mb-8">
          <span className="font-serif text-xl text-gold-shimmer font-bold tracking-wide">MAHID AROMAS</span>
        </Link>

        <ProgressBar step={step} />

        {/* Stripe inline payment (rendered after order created) */}
        {stripeClientSecret && stripePromise ? (
          <div className="card p-6 space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-text-primary">Card Payment</h2>
            <p className="text-text-muted text-sm font-sans">
              Complete your payment of{' '}
              <span className="text-gold font-semibold">{formatPKR(cartTotal + shippingFee)}</span>
            </p>
            <Elements stripe={stripePromise} options={stripeOptions}>
              <StripePaymentForm
                orderId={stripeOrderId}
                onSuccess={() => { clearCart(); navigate(`/order-success/${stripeOrderId}?via=stripe`); }}
                onError={(msg) => setApiError(msg)}
              />
            </Elements>
            {apiError && <p className="text-sm text-red-400 font-sans">{apiError}</p>}
          </div>
        ) : (
          <div className="card p-6 sm:p-8">
            {apiError && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-sans">
                {apiError}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <ShippingStep
                  key="s1" data={shipping} onChange={handleShippingChange}
                  onNext={handleShippingNext} errors={shippingErrors}
                />
              )}
              {step === 2 && (
                <PaymentStep
                  key="s2" selected={paymentMethod} onSelect={setPaymentMethod}
                  onNext={() => setStep(3)} onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <ReviewStep
                  key="s3"
                  cartItems={cartItems} cartTotal={cartTotal} shippingFee={shippingFee}
                  paymentMethod={paymentMethod} shippingData={shipping}
                  onBack={() => setStep(2)} onPlaceOrder={handlePlaceOrder} isPlacing={isPlacing}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
