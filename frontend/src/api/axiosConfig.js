import axios from 'axios';

// ─── Base Instance ─────────────────────────────────────────────────────────────
// Uses VITE_API_URL directly, strips trailing slashes/accidental trailing /api to prevent duplication
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.replace(/\/+$/, '').replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: baseURL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 s timeout — fail fast rather than hang
});

// ─── Request Interceptor: Attach JWT ─────────────────────────────────────────
// Reads the token from localStorage on every outgoing request so that
// token updates (e.g. after profile change) are picked up automatically.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ma_token'); // "ma" = Mahid Aromas prefix
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Global Error Handling ─────────────────────────────
api.interceptors.response.use(
  (response) => response, // pass successes straight through

  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Token expired / invalid → force logout
    if (status === 401) {
      localStorage.removeItem('ma_token');
      localStorage.removeItem('ma_user');
      // Redirect to login only if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }

    // Re-attach the cleaned message so callers can use error.message directly
    error.message = message;
    return Promise.reject(error);
  }
);

export default api;

// ─── Typed endpoint modules ────────────────────────────────────────────────────
// Import these in pages/components for clean, self-documenting API calls.

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  addAddress: (data) => api.post('/api/auth/address', data),
};

export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  getAllAdmin: (params) => api.get('/api/products/admin/all', { params }),
};

export const ordersAPI = {
  create: (data) => api.post('/api/orders', data),
  getMyOrders: () => api.get('/api/orders/my'),
  getById: (id) => api.get(`/api/orders/${id}`),
  stripeIntent: (data) => api.post('/api/orders/stripe/payment-intent', data),
  jazzCashInitiate: (data) => api.post('/api/orders/jazzcash/initiate', data),
};

export const adminAPI = {
  // Orders operations
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updateStatus: (id, data) => api.put(`/api/admin/orders/${id}/status`, data),
  updateTracking: (id, data) => api.put(`/api/admin/orders/${id}/tracking`, data),
  generateAWB: (id) => api.post(`/api/admin/orders/${id}/generate-awb`),
  getInvoiceUrl: (id) => `${baseURL}/api/admin/orders/${id}/invoice`,

  // Product catalog operations
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  getProductsAdmin: (params) => api.get('/api/products', { params }),
};
