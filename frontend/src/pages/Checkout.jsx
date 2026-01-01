import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaCreditCard, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

import Input from "../components/ui/input.jsx";
import Label from "../components/ui/label.jsx";
import Button from "../components/ui/button.jsx";

import { placeOrder } from "../api/order.api.js";
import { apiGetUserCart } from "../api/cart.api.js";

const Checkout = () => {
  const { cartItems, setCartItems, clearCartBackend } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "COD",
  });

  /* ================= LOAD CART ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await apiGetUserCart();
        setCartItems(res.data.cart.items || []);
      } catch (err) {
        console.error("Cart load error", err);
      }
    })();
  }, []);

  const total = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= PLACE ORDER ================= */
  const handlePlaceOrder = async (method) => {
    if (!cartItems.length) {
      return Swal.fire("Cart Empty", "Please add items first", "warning");
    }

    if (
      !form.name ||
      !form.mobile ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      return Swal.fire(
        "Missing Details",
        "Please fill all required fields",
        "error"
      );
    }

    const orderItems = cartItems.map((i) => ({
      productId: i.product._id,
      quantity: i.quantity,
      type: i.type,
      size: i.size,
      image: i.product?.images?.[0] || "",
    }));

    const payload = {
      orderItems,
      shippingAddress: {
        name: form.name,
        street: form.address,
        city: form.city,
        pincode: form.pincode,
        phone: form.mobile,
        state: "India",
      },
      paymentMethod: method === "online" ? "online" : "COD",
      shippingPrice: 0,
      itemsPrice: total,
      totalPrice: total,
    };

    try {
      setLoading(true);
      const res = await placeOrder(payload);

      if (res.data.success) {
        Swal.fire(
          "Order Placed 🎉",
          "Thank you! Your order has been confirmed",
          "success"
        );
        await clearCartBackend();
        navigate("/orders");
      }
    } catch (err) {
      Swal.fire(
        "Order Failed",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR CART ================= */
  const handleClear = async () => {
    setLoading(true);
    const data = await clearCartBackend();
    setLoading(false);

    if (data.success) {
      Swal.fire("Cart Cleared", "Your cart is empty", "success");
      navigate("/shop");
    }
  };

  /* ================= JSX ================= */
  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10 relative">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-semibold text-gray-700">
            Processing your order…
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8">
        {/* LEFT — ADDRESS */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FaShoppingBag className="text-indigo-600" />
            Delivery Details
          </h2>

          <div>
            <Label>Full Name *</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>

          <div>
            <Label>Mobile Number *</Label>
            <Input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <Label>Full Address *</Label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 h-24 bg-gray-50 outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City *</Label>
              <Input name="city" value={form.city} onChange={handleChange} />
            </div>

            <div>
              <Label>Pincode *</Label>
              <Input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* PAYMENT */}
          <div className="pt-4 border-t">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
              Payment Method
            </p>

            <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={form.paymentMethod === "COD"}
                onChange={handleChange}
              />
              Cash on Delivery (COD)
            </label>
          </div>

          <Button
            onClick={() => handlePlaceOrder("COD")}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Place Order
          </Button>
        </div>

        {/* RIGHT — SUMMARY */}
        <aside className="bg-white border rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-24">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FaCreditCard className="text-indigo-600" />
            Order Summary
          </h3>

          {cartItems.map((i) => (
            <div
              key={`${i.product._id}-${i.size}`}
              className="flex justify-between text-sm border-b pb-2 mb-2"
            >
              <span>
                {i.product.name} ({i.size.toUpperCase()}) × {i.quantity}
              </span>
              <span className="font-semibold">
                ₹{(i.price * i.quantity).toLocaleString()}
              </span>
            </div>
          ))}

          <div className="flex justify-between text-sm mt-3">
            <span>Delivery</span>
            <span className="text-green-600 font-semibold">Free</span>
          </div>

          <div className="border-t mt-3 pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button
            onClick={handleClear}
            className="mt-5 w-full text-sm border py-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <FaTrash /> Clear Cart
          </button>
        </aside>
      </div>
    </section>
  );
};

export default Checkout;
