import api from "./axios.js";

// ✅ Get all categories (public)
export const getAllCategories = async (params = {}) => {
  const res = await api.get("/categories", { params });
  return res.data;
};

// ✅ Get single category by ID (public)
export const getCategoryById = async (id) => {
  const res = await api.get(`/categories/${id}`);
  return res.data;
};

// ✅ Create category (admin only, image optional, multipart/form-data)
export const createCategory = async (formData) => {
  const res = await api.post("/categories/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Update category (admin only)
export const updateCategory = async (id, data) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

// ✅ Delete category (admin only)
export const deleteCategory = async (id) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};
