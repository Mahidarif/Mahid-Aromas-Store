import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ma_cart'; // "ma" = Mahid Aromas

export function CartProvider({ children }) {
  // ── State ────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Persist to localStorage on every change ───────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch { /* quota exceeded — ignore */ }
  }, [cartItems]);

  // ── addToCart ──────────────────────────────────────────────────────────
  // If the same variation already exists, increment quantity.
  // Otherwise push a new cart row.
  const addToCart = useCallback((product, variation, quantity = 1) => {
    if (!product || !variation) return;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.variation._id === variation._id.toString()
      );

      if (existingIdx !== -1) {
        // Cap at the available stock
        const updated = [...prev];
        const newQty  = Math.min(
          updated[existingIdx].quantity + quantity,
          variation.stockQuantity || 99
        );
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      }

      return [
        ...prev,
        {
          product: {
            _id:   product._id,
            name:  product.name,
            brand: product.brand,
            slug:  product.slug,
            images: product.images || [],
          },
          variation: {
            _id:           variation._id.toString(),
            size:          variation.size,
            concentration: variation.concentration,
            price:         variation.price,
            sku:           variation.sku,
            stockQuantity: variation.stockQuantity,
          },
          quantity,
        },
      ];
    });

    setIsDrawerOpen(true); // auto-open drawer on add
  }, []);

  // ── removeFromCart ────────────────────────────────────────────────────
  const removeFromCart = useCallback((variationId) => {
    setCartItems((prev) => prev.filter((item) => item.variation._id !== variationId));
  }, []);

  // ── updateQuantity ────────────────────────────────────────────────────
  const updateQuantity = useCallback((variationId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.variation._id === variationId
          ? { ...item, quantity: Math.min(quantity, item.variation.stockQuantity || 99) }
          : item
      )
    );
  }, []);

  // ── clearCart ─────────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Computed values ───────────────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.variation.price * item.quantity,
    0
  );

  const shippingFee = cartTotal >= 5000 ? 0 : 200;

  // ── Drawer helpers ────────────────────────────────────────────────────
  const openDrawer  = useCallback(() => setIsDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        shippingFee,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Named export for clean imports
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
