import api from './axiosConfig';

/**
 * Admin Products API Client Module
 *
 * Provides dedicated helper endpoints for inventory management,
 * product lifecycle CRUD, and Cloudinary media uploads.
 */

// ─── Fetch All Products (Admin) ───────────────────────────────────────────────
export const fetchAdminProducts = async (params = {}) => {
  return await api.get('/products/admin/all', { params });
};

// ─── Create New Product ───────────────────────────────────────────────────────
export const createProduct = async (productData) => {
  return await api.post('/products', productData);
};

// ─── Update Existing Product ──────────────────────────────────────────────────
export const updateProduct = async (id, productData) => {
  return await api.put(`/products/${id}`, productData);
};

// ─── Delete / Unpublish Product ───────────────────────────────────────────────
export const deleteProduct = async (id, permanent = false) => {
  return await api.delete(`/products/${id}`, {
    params: { permanent },
  });
};

// ─── Direct Media Upload to Cloudinary ────────────────────────────────────────
export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.url;
};

export default {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
