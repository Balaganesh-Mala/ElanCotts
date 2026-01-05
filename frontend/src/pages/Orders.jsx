import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";

const Orders = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        const res = await api.get("/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(res.data.orders || []);
      } catch (err) {
        Swal.fire(
          "Error",
          err?.response?.data?.message || "Failed to load orders",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  /* ================= UI ================= */
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        {/* PAGE HEADER SKELETON */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
          </div>
          <div className="h-9 w-36 bg-slate-200 rounded-lg" />
        </div>

        {/* TABLE SKELETON */}
        <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="divide-y">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-7 gap-4 px-5 py-5 items-center"
              >
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-6 w-10 bg-slate-200 rounded-full mx-auto" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
                <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">You have no orders yet</p>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">My Orders</h1>
          <p className="text-sm text-slate-500">Track and manage your orders</p>
        </div>

        <button
          onClick={() => navigate("/shop")}
          className="px-4 py-2 rounded-lg text-sm font-medium
        bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 border-b">
            <tr className="text-slate-600">
              <th className="px-5 py-4 font-medium">Order ID</th>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="px-5 py-4 font-medium">Products</th>
              <th className="px-5 py-4 font-medium text-center">Items</th>
              <th className="px-5 py-4 font-medium">Total</th>
              <th className="px-5 py-4 font-medium">Payment</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50 transition">
                {/* ORDER ID */}
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    #{order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.paymentMethod}
                  </p>
                </td>

                {/* DATE */}
                <td className="px-5 py-4 text-slate-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                {/* PRODUCTS */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {order.orderItems.slice(0, 3).map((item, index) => (
                      <img
                        key={index}
                        src={item.image}
                        alt={item.name}
                        /* 🟢 Tooltip */
                        title={item.name}
                        /* 🟢 Click → Order details */
                        onClick={() => navigate(`/orders/${order._id}`)}
                        /* 🟢 Hover zoom + pointer */
                        className="
      w-10 h-12 rounded-md object-cover border
      cursor-pointer
      hover:scale-105 hover:shadow-md
      transition-transform duration-200
    "
                      />
                    ))}

                    {order.orderItems.length > 3 && (
                      <span className="text-xs text-slate-500">
                        +{order.orderItems.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* ITEMS COUNT */}
                <td className="px-5 py-4 text-center">
                  <span
                    className="inline-flex items-center justify-center
    min-w-[28px] px-2 py-1 rounded-full
    bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    {order.orderItems.length}
                  </span>
                </td>

                {/* TOTAL */}
                <td className="px-5 py-4 font-semibold text-slate-800">
                  ₹{order.totalPrice.toFixed(2)}
                </td>

                {/* PAYMENT STATUS */}
                <td className="px-5 py-4">
                  <p className="text-slate-700 font-medium">
                    {order.paymentStatus}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.paymentMethod}
                  </p>
                </td>

                {/* ORDER STATUS */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    order.orderStatus === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.orderStatus === "CANCELLED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                  >
                    {order.orderStatus}
                  </span>
                </td>

                {/* ACTION */}
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    View / Track →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Orders;
