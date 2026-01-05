import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";

import emptyOrderGif from "../assets/gif/emptyOrder.gif";

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
        {/* GIF */}
        <img
          src={emptyOrderGif}
          alt="No orders"
          className="w-52 h-52 object-contain"
        />

        {/* TEXT */}
        <h2 className="text-xl font-semibold text-slate-800">No orders yet</h2>

        <p className="text-sm text-slate-500 max-w-sm">
          Looks like you haven’t placed any orders yet. Start shopping to see
          your orders here.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/shop")}
          className="mt-2 px-6 py-3 rounded-xl
        bg-indigo-600 text-white font-semibold
        hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const openReviewModal = async (productId, productName) => {
    let selectedRating = 0;

    const result = await Swal.fire({
      title: `Rate & Review`,
      html: `
      <div style="text-align:left">
        <p style="font-weight:600;margin-bottom:8px text-[14px]">${productName}</p>

        <!-- STARS -->
        <div id="star-container" style="
          display:flex;
          gap:8px;
          font-size:42px;
          justify-content:center;
          margin:12px 0;
          cursor:pointer;
        ">
          ${[1, 2, 3, 4, 5]
            .map(
              (n) =>
                `<span data-star="${n}" style="color:#cbd5e1;transition:.2s">★</span>`
            )
            .join("")}
        </div>

        <p id="rating-text" style="
          text-align:center;
          font-size:14px;
          color:#64748b;
          margin-bottom:10px
        ">
          Tap to rate
        </p>

        <!-- COMMENT -->
        <textarea
          id="review-comment"
          class="swal2-textarea"
          placeholder="Share your experience (optional)"
          style="
            min-height:90px;
            border-radius:12px;
            font-size:14px0;
            width:85%
          "
        ></textarea>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Submit Review",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4f46e5",
      focusConfirm: false,

      didOpen: () => {
        const stars = document.querySelectorAll("#star-container span");
        const ratingText = document.getElementById("rating-text");

        const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

        stars.forEach((star, index) => {
          // HOVER
          star.addEventListener("mouseenter", () => {
            stars.forEach((s, i) => {
              s.style.color = i <= index ? "#f59e0b" : "#cbd5e1";
            });
            ratingText.textContent = labels[index];
          });

          // CLICK
          star.addEventListener("click", () => {
            selectedRating = index + 1;
            ratingText.textContent = `You rated: ${labels[index]}`;
          });
        });

        // RESET on mouse leave
        document
          .getElementById("star-container")
          .addEventListener("mouseleave", () => {
            stars.forEach((s, i) => {
              s.style.color = i < selectedRating ? "#f59e0b" : "#cbd5e1";
            });
            ratingText.textContent =
              selectedRating > 0
                ? `You rated: ${labels[selectedRating - 1]}`
                : "Tap to rate";
          });
      },

      preConfirm: () => {
        const comment = document.getElementById("review-comment").value.trim();

        if (selectedRating === 0) {
          Swal.showValidationMessage("Please select a rating ⭐");
          return false;
        }

        return { rating: selectedRating, comment };
      },
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/products/${productId}/reviews`, result.value, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Thank you!",
        text: "Your review has been submitted",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to add review",
        "error"
      );
    }
  };

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
              <th className="px-5 py-4 font-medium">Review</th>
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
                  <div className="flex gap-3 flex-wrap">
                    {order.orderItems.map((item) => (
                      <img
                        key={item.product._id}
                        src={item.image}
                        alt={item.name}
                        title={item.name}
                        className="w-10 h-12 rounded-md object-cover border"
                      />
                    ))}
                  </div>
                </td>

                {/* ITEMS */}
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex min-w-[28px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    {order.orderItems.length}
                  </span>
                </td>

                {/* TOTAL */}
                <td className="px-5 py-4 font-semibold text-slate-800">
                  ₹{order.totalPrice.toFixed(2)}
                </td>

                {/* PAYMENT */}
                <td className="px-5 py-4">
                  <p className="text-slate-700 font-medium">
                    {order.paymentStatus}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.paymentMethod}
                  </p>
                </td>

                {/* STATUS */}
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

                {/* ⭐ REVIEW COLUMN */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    {order.orderItems.map((item) => (
                      <button
                        key={item.product._id}
                        disabled={order.orderStatus !== "DELIVERED"}
                        onClick={() =>
                          openReviewModal(item.product._id, item.name)
                        }
                        className={`text-xs font-medium text-left
                ${
                  order.orderStatus === "DELIVERED"
                    ? "text-indigo-600 hover:underline"
                    : "text-slate-400 cursor-not-allowed"
                }`}
                      >
                        {order.orderStatus === "DELIVERED"
                          ? "Add Review"
                          : "Pending"}
                      </button>
                    ))}
                  </div>
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
