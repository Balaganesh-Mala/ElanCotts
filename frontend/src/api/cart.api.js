import api from "./axios.js";

// ⭐ Add to Cart
export const apiAddToCart = (productId, qty, type, size) =>
  api.post("/cart/add", { productId, qty, type, size });

export const apiUpdateCartItem = (productId, qty, type, size) =>
  api.put("/cart/update", { productId, quantity: qty, type, size });

export const apiRemoveFromCart = (productId, type, size) =>
  api.delete("/cart/remove", { data: { productId, type, size } });

// ⭐ Get cart
export const apiGetUserCart = () => api.get("/cart");

// ⭐ Clear
export const apiClearCart = () => api.delete("/cart/clear");

export const apiPlaceOrder = (payload) => api.post("/api/orders", payload);
