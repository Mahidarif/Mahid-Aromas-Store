import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Layers,
  Store,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ─── Load Authenticated Admin User ─────────────────────────────────────────
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ma_user');
      if (storedUser) {
        setAdminUser(JSON.parse(storedUser));
      }
    } catch {
      // Fallback
    }
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // ─── Logout Handler ────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('ma_token');
    localStorage.removeItem('ma_user');
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Orders & Fulfillment',
      to: '/admin',
      end: true,
      icon: Package,
      badge: 'Live',
    },
    {
      name: 'Catalog & Inventory',
      to: '/admin/products',
      end: false,
      icon: Layers,
      badge: 'Stock',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased overflow-x-hidden">
      
      {/* ── 1. Mobile Sidebar Backdrop Overlay ──────────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── 2. Responsive SaaS Sidebar (Hidden on Mobile < md, Slide-in Drawer) ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* Logo Bar */}
          <div className="h-16 px-5 sm:px-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo-mark-white.png"
                alt="Mahid Aromas Logo"
                className="w-8 h-8 object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
              />
              <div>
                <span className="font-bold tracking-wider text-sm text-white block leading-tight">
                  MAHID AROMAS
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 font-medium uppercase">
                  Management Console
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={isActive ? 'text-amber-400' : 'text-slate-400'}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isActive
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-4">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Shortcuts
              </p>
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Store size={18} className="text-slate-400" />
                  <span>Customer Storefront</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom User Card & Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
              {adminUser?.name ? adminUser.name[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {adminUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {adminUser?.email || 'admin@mahidaromas.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── 3. Main Dashboard Wrapper ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        
        {/* Sticky Mobile/Desktop Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 md:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger Button (Visible only on mobile < md) */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-none">
                {location.pathname === '/admin/products'
                  ? 'Inventory & Catalog'
                  : 'Orders & Fulfillment'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck size={11} /> Admin Active
              </span>
            </div>
          </div>

          {/* Right Header Quick Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Store size={14} />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              {adminUser?.name ? adminUser.name[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
