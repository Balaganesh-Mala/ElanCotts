import React, { createContext, useContext, useState } from "react";
import {
  apiAddToCart,
  apiGetUserCart,
  apiUpdateCartItem,
  apiRemoveFromCart,
  apiClearCart,
} from "../api/cart.api.js";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // ✅ Fetch user cart
  const fetchCart = async () => {
    const res = await apiGetUserCart();
    setCartItems(res.data.cart.items);
    return res.data;
  };

  // ✅ Add to Cart
  const addToCartBackend = async (productId, qty, sizeObj) => {
  const res = await apiAddToCart(productId, qty, sizeObj.type, sizeObj.size);
  setCartItems(res.data.cart.items);
  return res.data;
};


  // ✅ Update Cart Quantity
  const updateQtyBackend = async (productId, qty, type, size) => {
    const res = await apiUpdateCartItem(productId, qty, type, size);
    setCartItems(res.data.cart.items);
    return res.data;
  };

  // ✅ Remove Item
  const removeItemBackend = async (productId, type, size) => {
    const res = await apiRemoveFromCart(productId, type, size);
    setCartItems(res.data.cart.items);
    return res.data;
  };

  // ✅ Clear Cart
  const clearCartBackend = async () => {
    const res = await apiClearCart();
    setCartItems(res.data.cart.items);
    return res.data;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        fetchCart,
        addToCartBackend,
        updateQtyBackend,
        removeItemBackend,
        clearCartBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
