import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import App from "./App";
import "./styles/tailwind.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <RecentlyViewedProvider>
          <App />
        </RecentlyViewedProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
