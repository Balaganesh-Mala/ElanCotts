import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { FiChevronDown } from "react-icons/fi";
import CheckoutSkeleton from "../components/ui/CheckoutSkeleton";

const formatPrice = (value) => Number(value).toFixed(2);
/* ===== UI-ONLY TAX (ESTIMATED) ===== */
const CGST_RATE = 0.025;
const SGST_RATE = 0.025;

const Checkout = () => {
  const navigate = useNavigate();
  const { setCartItems } = useCart();

  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return null;
  }

  /* ================= STATE ================= */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [preview, setPreview] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const [summary, setSummary] = useState({
    itemsPrice: 0,
  });

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setLoading(true);

        const res = await api.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.cart || res.data.cart.items.length === 0) {
          navigate("/cart");
          return;
        }

        const itemsPrice = res.data.cart.items.reduce(
          (sum, item) => sum + item.price * item.qty,
          0
        );

        setItems(res.data.cart.items);
        console.log("checkout data: ", res.data.cart.items);
        setSummary({ itemsPrice });
      } catch {
        Swal.fire("Error", "Failed to load checkout", "error");
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [navigate, token]);

  /* ================= COUPON (UI ONLY) ================= */
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      return Swal.fire("Enter coupon code");
    }

    try {
      const res = await api.post(
        "/orders/preview",
        { couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPreview(res.data.preview);
      setCouponApplied(true);

      Swal.fire("Success", "Coupon applied", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Invalid coupon",
        "error"
      );
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setPreview(null); // 🔥 IMPORTANT
  };

  /* ================= ESTIMATED TOTAL (UI ONLY) ================= */
  const estimatedDiscount = 0; // backend will calculate real discount
  const taxableAmount = summary.itemsPrice - estimatedDiscount;
  const estimatedCgst = taxableAmount * CGST_RATE;
  const estimatedSgst = taxableAmount * SGST_RATE;
  const estimatedTotal = taxableAmount + estimatedCgst + estimatedSgst;

  /* ================= VALIDATE ADDRESS ================= */
  const isAddressValid = () => {
    return (
      address.name &&
      address.phone.length === 10 &&
      address.street &&
      address.city &&
      address.state &&
      address.pincode.length === 6
    );
  };

  /* ================= COD ORDER ================= */
  const placeOrderCOD = async () => {
    if (!isAddressValid()) {
      return Swal.fire(
        "Invalid address",
        "Fill all fields correctly",
        "warning"
      );
    }

    try {
      setPlacing(true);

      await api.post(
        "/orders/cod",
        {
          shippingAddress: address,
          couponCode: couponApplied ? couponCode : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems([]);
      setCouponCode("");
      setCouponApplied(false);

      Swal.fire("Success", "Order placed successfully", "success");
      navigate("/orders");
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Order failed",
        "error"
      );
    } finally {
      setPlacing(false);
    }
  };

  /* ================= LOAD RAZORPAY ================= */
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /* ================= ONLINE PAYMENT ================= */
  const startOnlinePayment = async () => {
    if (!isAddressValid()) {
      return Swal.fire(
        "Invalid address",
        "Fill all fields correctly",
        "warning"
      );
    }

    try {
      setPlacing(true);

      const loaded = await loadRazorpay();
      if (!loaded) {
        setPlacing(false);
        return Swal.fire("Error", "Razorpay failed to load", "error");
      }

      /* 1️⃣ Create Razorpay Order */
      const res = await api.post(
        "/payments/razorpay/create",
        {
          couponCode: couponApplied ? couponCode : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const razorpayOrder = res.data.razorpayOrder;

      /* 2️⃣ Open Razorpay */
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.id,
        name: "Elan Cotts",

        handler: async (response) => {
          try {
            await api.post(
              "/payments/razorpay/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress: address,
                couponCode: couponApplied ? couponCode : null,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setCartItems([]);
            setCouponCode("");
            setCouponApplied(false);

            Swal.fire("Success", "Payment successful", "success");
            navigate("/orders");
          } catch (err) {
            Swal.fire(
              "Error",
              err?.response?.data?.message || "Payment verification failed",
              "error"
            );
          } finally {
            setPlacing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPlacing(false);
            Swal.fire("Cancelled", "Payment was cancelled", "info");
          },
        },

        prefill: {
          name: address.name,
          contact: address.phone,
        },

        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPlacing(false);
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Payment failed",
        "error"
      );
    }
  };

  /* ================= UI ================= */
  if (loading) {
  return <CheckoutSkeleton />;
}


  /* ================= ORDER CALCULATIONS ================= */
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.qty, 0);

  const sellingSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const productDiscount = mrpTotal - sellingSubtotal;

  const couponDiscount = preview?.discount ?? 0;

  const shippingCharge = sellingSubtotal >= 2000 ? 0 : 99;

  const cgst = (sellingSubtotal - couponDiscount) * CGST_RATE;
  const sgst = (sellingSubtotal - couponDiscount) * SGST_RATE;

  const taxTotal = cgst + sgst;

  const finalPayable =
    sellingSubtotal - couponDiscount + shippingCharge + taxTotal;

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8">
        {/* ================= LEFT : ADDRESS & PAYMENT ================= */}
        <div className="lg:col-span-2 space-y-8">
          {/* ================= DELIVERY ADDRESS ================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">
                Delivery Address
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please enter your shipping details
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* NAME */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-500">
                    Full Name
                  </label>
                  <input
                    placeholder="Enter full name"
                    value={address.name}
                    onChange={(e) =>
                      setAddress({ ...address, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
            focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* STREET */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-500">
                    Street Address
                  </label>
                  <input
                    placeholder="House no, area, street"
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
            focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* CITY */}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    City
                  </label>
                  <input
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
            focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* STATE */}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    State
                  </label>
                  <input
                    placeholder="State"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
            focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Phone Number
                  </label>
                  <input
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
            focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* PINCODE */}
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Pincode
                  </label>
                  <input
                    placeholder="6 digit pincode"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({
                        ...address,
                        pincode: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
            focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= PAYMENT METHOD ================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">
                Payment Method
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose how you want to pay
              </p>
            </div>

            <div className="p-6 space-y-4">
              {[
                {
                  id: "COD",
                  label: "Cash on Delivery",
                  desc: "Pay when item arrives",
                },
                {
                  id: "PREPAID",
                  label: "Online Payment",
                  desc: "UPI, Cards, Netbanking via Razorpay",
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition
          ${
            paymentMethod === m.id
              ? "border-indigo-600 bg-indigo-50"
              : "border-slate-300 hover:border-indigo-400"
          }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="mt-1 accent-indigo-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {m.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT : ORDER SUMMARY ================= */}
        <div className="relative bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-md h-fit sticky top-6 overflow-hidden">
          {/* HEADER */}
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Order Summary
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review your order details
            </p>
          </div>
          {/* PRODUCTS */}
          <div className="space-y-3 px-4">
            {items.map((item) => (
              <div key={item.variantSku} className="flex gap-3 items-start">
                <img
                  src={item.image}
                  alt={item.product?.name}
                  className="w-14 h-16 rounded-lg object-cover border"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">
                    {item.product?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.color} • {item.size}
                  </p>
                  <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  ₹{formatPrice(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 my-4" />

          {/* BODY */}
          <div className="px-6 pb-6 space-y-5 text-sm">
            {/* PRICE BREAKDOWN */}

            <div className="space-y-3">
              {/* MRP */}
              <div className="flex justify-between">
                <span className="text-slate-500">MRP Total</span>
                <span className="text-slate-700">₹{formatPrice(mrpTotal)}</span>
              </div>

              {/* PRODUCT DISCOUNT */}
              {productDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount on MRP</span>
                  <span>− ₹{formatPrice(productDiscount)}</span>
                </div>
              )}

              {/* SUBTOTAL */}
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-800">
                  ₹{formatPrice(sellingSubtotal)}
                </span>
              </div>

              {/* COUPON */}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>− ₹{formatPrice(couponDiscount)}</span>
                </div>
              )}

              {/* SHIPPING */}
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                {shippingCharge === 0 ? (
                  <span className="text-emerald-600 font-medium">Free</span>
                ) : (
                  <span className="text-slate-700">
                    ₹{formatPrice(shippingCharge)}
                  </span>
                )}
              </div>

              {/* TAX (DROPDOWN STYLE) */}
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-slate-500 list-none">
                  <div className="flex items-center gap-2">
                    <span>Tax (GST)</span>

                    {/* ARROW */}
                    <FiChevronDown
                      className="transition-transform duration-300
        group-open:rotate-180"
                      size={16}
                    />
                  </div>

                  <span className="font-small  text-gray-600">
                    ₹{formatPrice(taxTotal)}
                  </span>
                </summary>

                {/* DROPDOWN CONTENT */}
                <div className="mt-2 pl-5 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>CGST (2.5%)</span>
                    <span>₹{formatPrice(cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (2.5%)</span>
                    <span>₹{formatPrice(sgst)}</span>
                  </div>
                </div>
              </details>
            </div>

            {/* DIVIDER */}
            <div className="border-t border-dashed border-slate-600" />
            <div className="flex justify-between"> 
            <span className="text-sm font-semibold text-slate-700">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{formatPrice(preview?.totalPrice ?? estimatedTotal)}
            </span>
            </div>
            {/* TOTAL */}
            

            {/* COUPON */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">
                Have a coupon?
              </label>

              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  disabled={couponApplied}
                  className="flex-1 rounded-xl border border-slate-300 bg-white
          px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400
          focus:outline-none disabled:bg-slate-100"
                />

                <button
                  onClick={applyCoupon}
                  disabled={couponApplied}
                  className="px-4 rounded-xl text-sm font-medium text-indigo-600
          border border-indigo-200 bg-indigo-50
          hover:bg-indigo-100 transition disabled:opacity-50"
                >
                  Apply
                </button>
              </div>

              {couponApplied && (
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove coupon
                </button>
              )}
            </div>

            {/* PLACE ORDER */}
            <button
              disabled={placing}
              onClick={() =>
                paymentMethod === "COD" ? placeOrderCOD() : startOnlinePayment()
              }
              className="mt-4 w-full py-4 rounded-2xl font-semibold text-white
      bg-gradient-to-r from-indigo-500 to-blue-500
      hover:from-indigo-600 hover:to-blue-600
      shadow-md transition disabled:opacity-60"
            >
              {placing ? "Processing..." : "Place Order"}
            </button>

            {/* TRUST NOTE */}
            <p className="text-[11px] text-center text-slate-400">
              🔒 Secure checkout • 100% safe payments
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
