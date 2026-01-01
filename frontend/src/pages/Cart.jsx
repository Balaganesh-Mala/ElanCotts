import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { apiGetUserCart } from "../api/cart.api.js";

const Cart = () => {
  const {
    cartItems,
    setCartItems,
    updateQtyBackend,
    removeItemBackend,
    clearCartBackend,
  } = useCart();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiGetUserCart();
        setCartItems(res.data.cart.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  /* ================= HANDLERS ================= */
  const handleQty = async (id, qty, type, size) => {
    if (qty <= 0) return handleRemove(id, type, size);

    setLoading(true);
    const data = await updateQtyBackend(id, qty, type, size);
    setLoading(false);

    if (data.success) {
      Swal.fire("Updated", "Quantity updated", "success");
    }
  };

  const handleRemove = async (id, type, size) => {
    setLoading(true);
    const data = await removeItemBackend(id, type, size);
    setLoading(false);

    if (data.success) {
      Swal.fire("Removed", "Item removed from cart", "success");
    }
  };

  const handleClear = async () => {
    setLoading(true);
    const data = await clearCartBackend();
    setLoading(false);

    if (data.success) {
      Swal.fire("Cart Cleared", "Your cart is now empty", "success");
    }
  };

  /* ================= JSX ================= */
  return (
    <section className="bg-gray-50 min-h-screen px-4 py-10 relative">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="mt-2 text-xs font-semibold text-gray-700">
            Updating cart…
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <FaShoppingCart className="text-indigo-600 text-xl" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Shopping Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          /* EMPTY CART */
          <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">
              Your cart is empty. Let’s add something stylish ✨
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* CART CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
            {/* ITEMS */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.product?._id}-${item.size}`}
                  className="bg-white border rounded-2xl p-4 sm:p-5 flex gap-4 shadow-sm"
                >
                  <img
                    src={item.product?.images?.[0] || "/placeholder.png"}
                    alt={item.product?.name}
                    className="w-20 h-24 object-cover rounded-xl border"
                  />

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {item.product?.name}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Size: {item.size.toUpperCase()}
                    </p>

                    <p className="font-bold text-sm mt-2">
                      ₹{item.price.toLocaleString()}
                    </p>

                    {/* QTY */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() =>
                          handleQty(
                            item.product._id,
                            item.quantity - 1,
                            item.type,
                            item.size
                          )
                        }
                        className="w-8 h-8 rounded-full border hover:bg-gray-100"
                      >
                        −
                      </button>

                      <span className="text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleQty(
                            item.product._id,
                            item.quantity + 1,
                            item.type,
                            item.size
                          )
                        }
                        className="w-8 h-8 rounded-full border hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() =>
                      handleRemove(
                        item.product._id,
                        item.type,
                        item.size
                      )
                    }
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <aside className="bg-white border rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-24">
              <h3 className="font-semibold text-lg mb-4">
                Order Summary
              </h3>

              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>

              <div className="border-t my-3" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={handleClear}
                className="mt-3 w-full text-sm border py-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                <FaTrash /> Clear Cart
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
