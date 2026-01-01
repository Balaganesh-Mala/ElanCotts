import React from "react";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../../context/CartContext";

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQty, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div
      className={`fixed inset-0 bg-black/30 z-50 transition-all ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-xl p-6 transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaShoppingCart /> Cart
          </h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {cartItems.length === 0 && (
            <div className="text-gray-500 text-sm text-center mt-10">
              No items in cart
            </div>
          )}

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 border p-4 rounded-2xl bg-gray-50"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl border"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price.toLocaleString()}</p>

                {/* Qty Control */}
                <div className="flex items-center gap-2 pt-3">
                  <button
                    onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                    className="px-2 py-1 border rounded-full text-xs hover:border-black"
                  >−</button>
                  <span className="text-xs w-5 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="px-2 py-1 border rounded-full text-xs hover:border-black"
                  >+</button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-3 text-gray-500 hover:text-red-500"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="border-t pt-4 mt-4 space-y-4">

          <div className="flex justify-between items-center">
            <p className="font-bold text-sm">Total:</p>
            <p className="font-extrabold text-lg">₹{total.toLocaleString()}</p>
          </div>

          <button className="w-full bg-black text-white py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition">
            Checkout
          </button>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full bg-gray-100 py-2 rounded-full text-xs sm:text-sm hover:border-black border transition text-gray-900 flex items-center justify-center gap-2"
            >
              <FaTrash className="text-sm"/> Clear Cart
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
