import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import {
  FiBox,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiDownload,
  FiArrowLeft,
} from "react-icons/fi";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* ================= LOAD ORDER ================= */
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrder(res.data.order);
      } catch (err) {
        Swal.fire(
          "Error",
          err?.response?.data?.message || "Order not found",
          "error"
        );
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, token, navigate]);

  /* ================= DOWNLOAD INVOICE ================= */
  const downloadInvoice = async () => {
    try {
      setDownloading(true);

      const res = await api.get(`/orders/${order._id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${order.orderNo}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to download invoice",
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  /* ================= UI ================= */
 if (loading) {
  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* BACK BUTTON */}
        <div className="h-4 w-32 bg-slate-200 rounded" />

        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-200 rounded" />
          </div>
          <div className="h-7 w-28 bg-slate-200 rounded-full" />
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* ORDERED ITEMS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-100 rounded-xl p-4"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
              ))}
            </div>

            {/* SHIPPING ADDRESS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-56 bg-slate-200 rounded" />
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-200 rounded" />
            </div>

            {/* SHIPPING INFO */}
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-52 bg-slate-200 rounded" />
              <div className="h-4 w-44 bg-slate-200 rounded" />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* PAYMENT SUMMARY */}
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div className="h-5 w-44 bg-slate-200 rounded" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <div className="h-5 w-32 bg-slate-200 rounded" />
                  <div className="h-6 w-28 bg-slate-200 rounded" />
                </div>
              </div>
            </div>

            {/* INVOICE BUTTON */}
            <div className="h-14 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}



  if (!order) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ================= HEADER ================= */}
      {/* BACK */}
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:underline"
      >
        <FiArrowLeft />
        Back to Orders
      </button>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Order Details
          </h1>
          <p className="text-sm text-slate-500">
            Order No: <span className="font-medium">{order.orderNo}</span>
          </p>
          <p className="text-xs text-slate-400">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold
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
      </div>

      {/* ================= GRID ================= */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ================= LEFT ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* ORDERED ITEMS */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-lg overflow-hidden">
            <div
              className="flex items-center gap-4 px-6 py-5
      bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 border-b"
            >
              <div className="p-3 rounded-2xl bg-indigo-600/10">
                <FiBox className="text-indigo-600 text-lg" />
              </div>
              <h2 className="font-semibold text-slate-800 text-lg">
                Ordered Items
              </h2>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              {order.orderItems.map((item) => (
                <div
                  key={item.variantSku}
                  className="flex items-center justify-between
          rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <span
                      className="inline-flex items-center px-2 py-0.5
              rounded-full text-xs bg-indigo-100 text-indigo-700"
                    >
                      Qty {item.qty}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SHIPPING ADDRESS */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-lg overflow-hidden">
            <div
              className="flex items-center gap-4 px-6 py-5
      bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 border-b"
            >
              <div className="p-3 rounded-2xl bg-indigo-600/10">
                <FiMapPin className="text-indigo-600 text-lg" />
              </div>
              <h2 className="font-semibold text-slate-800 text-lg">
                Shipping Address
              </h2>
            </div>

            <div className="px-6 py-5 text-sm text-slate-700 space-y-1">
              <p className="font-semibold text-slate-800">
                {order.shippingAddress.name}
              </p>
              <p className="text-slate-600">📞 {order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} –{" "}
                {order.shippingAddress.pincode}
              </p>
              {order.shippingAddress.country && (
                <p>{order.shippingAddress.country}</p>
              )}
            </div>
          </div>

          {/* SHIPPING INFO */}
          {order.shiprocket?.awbCode && (
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-lg overflow-hidden">
              <div
                className="flex items-center gap-4 px-6 py-5
        bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 border-b"
              >
                <div className="p-3 rounded-2xl bg-indigo-600/10">
                  <FiTruck className="text-indigo-600 text-lg" />
                </div>
                <h2 className="font-semibold text-slate-800 text-lg">
                  Shipping Info
                </h2>
              </div>

              <div className="px-6 py-5 text-sm text-slate-700 space-y-2">
                <p>
                  <span className="text-slate-500">Courier:</span>{" "}
                  <span className="font-medium">
                    {order.shiprocket.courierName}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">AWB:</span>{" "}
                  <span className="font-medium">
                    {order.shiprocket.awbCode}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Status:</span>{" "}
                  <span
                    className="inline-flex px-3 py-1 rounded-full text-xs
            bg-blue-100 text-blue-700"
                  >
                    {order.shiprocket.status}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-6">
          {/* PAYMENT SUMMARY */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-lg overflow-hidden">
            {/* HEADER */}
            <div
              className="flex items-center gap-4 px-6 py-5
      bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100
      border-b"
            >
              <div className="p-3 rounded-2xl bg-indigo-600/10">
                <FiCreditCard className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-lg">
                  Payment Summary
                </h2>
                <p className="text-xs text-slate-500">
                  Complete payment breakdown
                </p>
              </div>
            </div>

            {/* BODY */}
            <div className="px-6 py-6 text-sm space-y-4">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal</span>
                <span className="font-medium">
                  ₹{order.itemsPrice.toFixed(2)}
                </span>
              </div>

              {Number(order.discountPrice) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -₹{order.discountPrice.toFixed(2)}
                  </span>
                </div>
              )}

              {order.tax?.total > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>CGST</span>
                    <span>₹{order.tax.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>SGST</span>
                    <span>₹{order.tax.sgst.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* TOTAL */}
              <div className="mt-4 pt-5 border-t flex justify-between items-center">
                <span className="text-base font-semibold text-slate-800">
                  {order.paymentMethod === "COD" &&
                  order.paymentStatus !== "PAID"
                    ? "Amount Payable"
                    : "Total Paid"}
                </span>

                <span
                  className="text-2xl font-bold
          bg-gradient-to-r from-indigo-600 to-blue-600
          bg-clip-text text-transparent"
                >
                  ₹{order.totalPrice.toFixed(2)}
                </span>
              </div>

              {/* META */}
              <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-slate-500">Payment Method</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {order.paymentMethod}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-slate-500">Payment Status</p>
                  <p
                    className={`font-semibold mt-1 ${
                      order.paymentStatus === "PAID"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* INVOICE DOWNLOAD */}
          {order.orderStatus === "DELIVERED" && (
            <button
              disabled={downloading}
              onClick={downloadInvoice}
              className={`w-full flex items-center justify-center gap-3
        px-5 py-4 rounded-2xl font-semibold text-white text-sm
        bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600
        hover:from-indigo-700 hover:via-blue-700 hover:to-sky-700
        shadow-lg transition-all duration-200
        ${
          downloading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.01]"
        }`}
            >
              <FiDownload className="text-lg" />
              {downloading
                ? "Downloading Invoice..."
                : "Download Invoice (PDF)"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
