import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  /* ================= AUTH CART ================= */
  const addToCartBackend = async ({ productId, variantSku, qty }) => {
    const res = await api.post(
      "/cart/add",
      { productId, variantSku, qty },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setCartItems(res.data.cart.items || []);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        
        addToCartBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
