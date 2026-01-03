import React from "react";
import { Routes, Route } from "react-router-dom";

/* Layouts */
import MainLayout from "../layout/MainLayout";
import AuthLayout from "../layout/AuthLayout";

/* Pages */
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import ProductDetails from "../pages/ProductDetails";
import CategoryProductPage from "../pages/CategoryProductPage";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import UserProfile from "../pages/UserProfile";
import Contact from "../pages/Contact";
import About from "../pages/About";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import ScrollToTop from "../components/layout/ScrollToTop";

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ================= AUTH ROUTES (NO NAVBAR / FOOTER) ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ================= MAIN ROUTES (WITH NAVBAR / FOOTER) ================= */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />

          {/* Product */}
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/category/:slug" element={<CategoryProductPage />} />

          {/* Cart & Orders */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          {/* User */}
          <Route path="/profile" element={<UserProfile />} />

          {/* Static */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
