import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { authAPI } from '../api/axiosConfig';
import SEO from '../components/SEO';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login({ email, password });
      const payload = response.data?.data || response.data;
      const token = payload?.token || response.data?.token;
      const user = payload;

      // Save credentials to localStorage
      if (token) localStorage.setItem('ma_token', token);
      if (user) localStorage.setItem('ma_user', JSON.stringify(user));

      // Route based on role or redirect parameter
      if (redirect) {
        navigate(redirect);
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for admin testing
  const fillAdminCredentials = () => {
    setEmail('admin@mahidaromas.com');
    setPassword('Admin@1234');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Sign In — Mahid Aromas"
        description="Sign in to your Mahid Aromas account or administration portal."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="card p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <img
                src="/logo-mark-white.png"
                alt="Mahid Aromas Logo"
                className="w-8 h-8 object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
              />
              <span className="font-serif font-bold text-lg text-gold-shimmer">
                MAHID AROMAS
              </span>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-text-muted font-sans">
              Enter your credentials to access your account or administrator portal.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-red-400 font-sans">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-medium text-text-secondary uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-luxury pl-10 text-sm"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans font-medium text-text-secondary uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury pl-10 pr-10 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Quick Admin Fill Helper Box */}
          <div className="pt-2 border-t border-white/5">
            <div className="bg-surface-2 p-3.5 rounded-xl border border-gold/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-semibold text-gold flex items-center gap-1">
                  <Sparkles size={12} /> Admin Credentials (Quick Fill)
                </span>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="text-[10px] text-text-primary hover:text-gold underline font-sans"
                >
                  Auto-Fill
                </button>
              </div>
              <div className="text-[11px] font-mono text-text-muted space-y-0.5">
                <div>Email: <span className="text-text-secondary">admin@mahidaromas.com</span></div>
                <div>Pass: <span className="text-text-secondary">Admin@1234</span></div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-text-muted font-sans flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-green-400" />
            <span>256-Bit SSL Encrypted Authentication</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
