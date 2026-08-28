import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every newly opened page starts cleanly scrolled to the top (0, 0).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll immediately to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant prevents disorienting scroll jumps on page load
    });
  }, [pathname]);

  return null;
}
