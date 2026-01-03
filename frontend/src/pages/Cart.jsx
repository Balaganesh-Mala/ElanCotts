import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCart();

  const token = localStorage.getItem("token");
  const isAuth = Boolean(token);

  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);

        // 🟢 AUTH CART
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
  }, [isAuth, token, setCartItems]);

  /* ================= SUBTOTAL ================= */
  const calculateSubtotal = (items) => {
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    setSubtotal(total);
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = async (variantSku, qty) => {
    if (qty <= 0) return removeItem(variantSku);

    // 🟡 GUEST
    if (!isAuth) {
      const updated = cartItems.map((i) =>
        i.variantSku === variantSku ? { ...i, qty } : i
      );
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
      calculateSubtotal(updated);
      return;
    }

    // 🟢 AUTH
    const res = await api.put(
      "/cart/update",
      { variantSku, qty },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCartItems(res.data.cart.items);
    setSubtotal(res.data.cart.itemsPrice);
  };

  /* ================= REMOVE ITEM ================= */
  const removeItem = async (variantSku) => {
    // 🟡 GUEST
    if (!isAuth) {
      const updated = cartItems.filter((i) => i.variantSku !== variantSku);
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
      calculateSubtotal(updated);
      return;
    }

    // 🟢 AUTH
    const res = await api.delete(`/cart/remove/${variantSku}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCartItems(res.data.cart.items);
    setSubtotal(res.data.cart.itemsPrice);
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

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
      {/* CART ITEMS */}
      <div className="lg:col-span-2 space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.variantSku}
            className="flex gap-4 border rounded-xl p-4"
          >
            <div className="flex-1">
              <p className="font-medium">{item.product?.name || "Product"}</p>
              <p className="text-xs text-gray-500">SKU: {item.variantSku}</p>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => updateQty(item.variantSku, item.qty - 1)}
                  className="px-3 border rounded"
                >
                  −
                </button>
                <span>{item.qty}</span>
                <button
                  onClick={() => updateQty(item.variantSku, item.qty + 1)}
                  className="px-3 border rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between items-end">
              <p className="font-semibold">₹{item.price * item.qty}</p>
              <button
                onClick={() => removeItem(item.variantSku)}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="border rounded-xl p-6 space-y-4 h-fit">
        <h3 className="font-semibold text-lg">Price Summary</h3>

        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Proceed to Checkout
        </button>
      </div>
    </section>
  );
};

export default Cart;
