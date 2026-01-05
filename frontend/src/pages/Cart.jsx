import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiTag,
  FiArrowRight,
} from "react-icons/fi";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCart();

  const token = localStorage.getItem("token");
  const isAuth = Boolean(token);

  const [loading, setLoading] = useState(true);
  const [updatingSku, setUpdatingSku] = useState(null);
  const [subtotal, setSubtotal] = useState(0);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!isAuth) {
      Swal.fire("Login Required", "Please login to view cart", "warning");
      navigate("/login");
      return;
    }

    const loadCart = async () => {
      try {
        setLoading(true);

        const res = await api.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cart = res.data.cart;

        if (!cart) {
          setCartItems([]);
          setSubtotal(0);
        } else {
          setCartItems(cart.items);
          setSubtotal(cart.itemsPrice);
        }
      } catch {
        Swal.fire("Error", "Failed to load cart", "error");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuth, token, navigate, setCartItems]);

  /* ================= UPDATE QTY ================= */
  const updateQty = async (variantSku, qty) => {
    if (qty <= 0) return removeItem(variantSku);

    try {
      setUpdatingSku(variantSku);

      const res = await api.put(
        "/cart/update",
        { variantSku, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(res.data.cart.items);
      setSubtotal(res.data.cart.itemsPrice);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update cart",
        "error"
      );
    } finally {
      setUpdatingSku(null);
    }
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (variantSku) => {
    setCartItems((prev) =>
      prev.filter((item) => item.variantSku !== variantSku)
    );

    try {
      await api.delete(`/cart/remove/${encodeURIComponent(variantSku)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      Swal.fire("Error", "Failed to remove item", "error");
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cart...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Your cart is empty</p>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const mrpTotal = cartItems.reduce(
    (sum, item) => sum + item.mrp * item.qty,
    0
  );

  const discount = mrpTotal - subtotal;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ================= CART ITEMS ================= */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.variantSku}
              className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4"
            >
              {/* IMAGE */}
              <img
                src={item.image}
                alt={item.product?.name}
                className="w-24 h-28 rounded-lg object-cover border"
              />

              {/* DETAILS */}
              <div className="flex-1">
                <h3 className="font-medium text-slate-800">
                  {item.product?.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {item.color} • Size {item.size}
                </p>

                {/* PRICE */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold text-slate-900">
                    ₹{item.price}
                  </span>
                  {item.mrp > item.price && (
                    <span className="text-xs line-through text-slate-400">
                      ₹{item.mrp}
                    </span>
                  )}
                </div>

                {/* QTY */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    disabled={updatingSku === item.variantSku}
                    onClick={() => updateQty(item.variantSku, item.qty - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded border hover:bg-slate-100 disabled:opacity-40"
                  >
                    <FiMinus size={14} />
                  </button>

                  <span className="w-6 text-center font-medium">
                    {item.qty}
                  </span>

                  <button
                    disabled={updatingSku === item.variantSku}
                    onClick={() => updateQty(item.variantSku, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded border hover:bg-slate-100 disabled:opacity-40"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end justify-between">
                <p className="font-semibold text-slate-900">
                  ₹{item.price * item.qty}
                </p>

                <button
                  disabled={updatingSku === item.variantSku}
                  onClick={() => removeItem(item.variantSku)}
                  className="flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-40"
                >
                  <FiTrash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit sticky top-24">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
            <FiShoppingCart className="text-indigo-600" />
            Price Summary
          </h2>

          <div className="space-y-3 text-sm">
            {/* MRP TOTAL */}
            <div className="flex justify-between">
              <span className="text-slate-600">MRP Total</span>
              <span className="text-slate-700">₹{mrpTotal}</span>
            </div>

            {/* DISCOUNT */}
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1">Discount on MRP</span>
                <span>-₹{discount}</span>
              </div>
            )}

            {/* SUBTOTAL */}
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-slate-800">₹{subtotal}</span>
            </div>

            {/* DELIVERY */}
            <div className="flex justify-between text-slate-500">
              <span>Delivery</span>
              <span>Free</span>
            </div>
          </div>

          <hr className="my-4" />

          {/* TOTAL */}
          <div className="flex justify-between text-base font-semibold">
            <span>Total Amount</span>
            <span>₹{subtotal}</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Proceed to Checkout
            <FiArrowRight />
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="w-full mt-3 text-sm text-indigo-600 hover:underline"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </section>
  );
};

export default Cart;
