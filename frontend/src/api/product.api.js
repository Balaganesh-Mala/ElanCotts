import api from "./axios.js";

// ✅ Get all products (public)
export const getAllProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  return res.data;
};

// ✅ Get single product by ID (public)
export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// ✅ Create product (admin only, 4 images, multipart/form-data)
export const createProduct = async (formData) => {
  const res = await api.post("/products/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Update product (admin only)
export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

// ✅ Delete product (admin only)
export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};


export const getReviewsByProduct = async (id) => {
  const res = await api.get(`/products/${id}/reviews`);
  return res.data;
};

// ✅ Post a new review (login only)
export const postReviewByProduct = async (id, data) => {
  const res = await api.post(`/products/${id}/review`, data);
  return res.data;
};