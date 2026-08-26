import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar               from './components/Navbar';
import Footer               from './components/Footer';
import CartDrawer           from './components/CartDrawer';
import HomePage             from './pages/HomePage';
import ProductDetailPage    from './pages/ProductDetailPage';
import CheckoutPage         from './pages/CheckoutPage';
import OrderSuccessPage     from './pages/OrderSuccessPage';
import AdminDashboard       from './pages/AdminDashboard';
import { useCart }          from './context/CartContext';

// ─── Placeholder for pages not yet built ─────────────────────────────────────
const ComingSoon = ({ page }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-3">
      <h1 className="font-serif text-3xl text-gold">{page}</h1>
      <p className="text-text-muted font-sans text-sm">Coming soon…</p>
    </div>
  </div>
);

// ─── Inner shell (needs CartContext for cartCount) ────────────────────────────
function AppShell() {
  const { cartCount } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-charcoal">
      <Navbar cartCount={cartCount} />
      <CartDrawer />

      <main className="flex-1">
        <Routes>
          <Route path="/"                       element={<HomePage />} />
          <Route path="/products"               element={<ComingSoon page="Collections" />} />
          <Route path="/products/:id"           element={<ProductDetailPage />} />
          <Route path="/checkout"               element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/admin"                  element={<AdminDashboard />} />
          <Route path="/login"                  element={<ComingSoon page="Sign In" />} />
          <Route path="/register"               element={<ComingSoon page="Create Account" />} />
          <Route path="/account"                element={<ComingSoon page="My Account" />} />
          <Route path="/track"                  element={<ComingSoon page="Track Order" />} />
          <Route path="/terms"                  element={<ComingSoon page="Terms of Service" />} />
          <Route path="/privacy"                element={<ComingSoon page="Privacy Policy" />} />
          <Route path="*"                       element={<ComingSoon page="Page Not Found" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

// ─── Root: CartProvider wraps everything so context is available everywhere ───
export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </BrowserRouter>
  );
}
