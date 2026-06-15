import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// include credentials so server-side auth cookies are sent with requests
const api = axios.create({ baseURL: `${API_URL}/api/v1`, withCredentials: true });

export const productsApi = {
  getAll: (params?: { category_id?: number; featured?: boolean; search?: string; skip?: number; limit?: number }) =>
    api.get('/products/', { params }).then(r => r.data),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`).then(r => r.data),
  getById: (id: number) => api.get(`/products/${id}`).then(r => r.data),
};

export const categoriesApi = {
  getAll: () => api.get('/categories/').then(r => r.data),
};

export const ordersApi = {
  create: (data: unknown) => api.post('/orders/', data).then(r => r.data),
  getAll: () => api.get('/orders/').then(r => r.data),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status?status=${status}`).then(r => r.data),
  delete: (id: number) => api.delete(`/orders/${id}`).then(r => r.data),
};

export const testimonialsApi = {
  getAll: () => api.get('/testimonials/').then(r => r.data),
  create: (data: unknown) => api.post('/testimonials/', data).then(r => r.data),
  approve: (id: number) => api.put(`/testimonials/${id}/approve`).then(r => r.data),
  delete: (id: number) => api.delete(`/testimonials/${id}`).then(r => r.data),
};

export const faqsApi = {
  getAll: () => api.get('/faqs/').then(r => r.data),
};

export const contactApi = {
  send: (data: unknown) => api.post('/contact/', data).then(r => r.data),
  getAll: () => api.get('/contact/').then(r => r.data),
  getOne: (id: number) => api.get(`/contact/${id}`).then(r => r.data),
  markRead: (id: number) => api.patch(`/contact/${id}/read`).then(r => r.data),
};

export const customOrdersApi = {
  create: (data: unknown) => api.post('/custom-orders/', data).then(r => r.data),
  getAll: () => api.get('/custom-orders/').then(r => r.data),
  getOne: (id: number) => api.get(`/custom-orders/${id}`).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch(`/custom-orders/${id}/status`, { status }).then(r => r.data),
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    // let the browser set the multipart boundary header automatically
    return api.post('/custom-orders/upload-image', fd).then(r => r.data);
  },
  uploadProductImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/custom-orders/upload-product-image', fd).then(r => r.data);
  },
};

export default api;