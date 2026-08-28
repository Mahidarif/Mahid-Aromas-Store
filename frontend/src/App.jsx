import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import CollectionsPage from './pages/CollectionsPage';
import BestSellersPage from './pages/BestSellersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import LoginPage from './pages/LoginPage';

// ─── Placeholder for secondary pages ──────────────────────────────────────────
const ComingSoon = ({ page }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-3">
      <h1 className="font-serif text-3xl text-gold">{page}</h1>
      <p className="text-text-muted font-sans text-sm">Coming soon…</p>
    </div>
  </div>
);

// ─── Inner shell with intelligent Storefront vs Admin Layout handling ─────────
function AppShell() {
  const { cartCount } = useCart();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-charcoal">
      {/* Scroll restoration helper: always opens new routes at the very top */}
      <ScrollToTop />

      {/* Show Customer Storefront Navbar & Slide-out CartDrawer on customer pages */}
      {!isAdminRoute && (
        <>
          <Navbar cartCount={cartCount} />
          <CartDrawer />
        </>
      )}

      <main className="flex-1">
        <Routes>
          {/* ── Public Customer Storefront Routes ───────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<CollectionsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/shop" element={<CollectionsPage />} />
          <Route path="/best-sellers" element={<BestSellersPage />} />
          <Route path="/bestsellers" element={<BestSellersPage />} />
          <Route path="/new-arrivals" element={<BestSellersPage />} />
          <Route path="/new" element={<BestSellersPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/cart" element={<Navigate to="/" replace />} />

          {/* ── Auth & Account Routes ───────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<ComingSoon page="Create Account" />} />
          <Route path="/account" element={<ComingSoon page="My Account" />} />
          <Route path="/track" element={<ComingSoon page="Track Order" />} />
          <Route path="/terms" element={<ComingSoon page="Terms of Service" />} />
          <Route path="/privacy" element={<ComingSoon page="Privacy Policy" />} />

          {/* ── Admin Management Routes (Nested under AdminLayout) ─────────── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<ComingSoon page="Page Not Found" />} />
        </Routes>
      </main>

      {/* Show Footer only on customer storefront */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

// ─── Root Application ────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </BrowserRouter>
  );
}
