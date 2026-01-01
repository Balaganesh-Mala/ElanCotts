import api from "./axios.js";

export const placeOrder = (payload) => api.post("/orders", payload);
export const getMyOrders = () => api.get("/orders/my-orders");
export const getAllOrders = () => api.get("/orders"); // admin only
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
