// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import HomePage from "./pages/admin/HomePage ";

import AdminLayout from "./components/layout/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import CategoryManager from "./pages/admin/CategoryManager";
import OrdersManager from "./pages/admin/OrdersManager";
import SettingsManager from "./pages/admin/SettingsManager";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import UserManagement from "./pages/admin/UserManagement";
import BannerManagement from "./pages/admin/BannerManagement";
import FixedBannerManager from "./pages/admin/FixedBannerManager";
import AdminVideos from "./pages/admin/AdminVideos";

// import your existing shop pages here...

const App = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public shop routes... */}
         <Route path="/" element={<HomePage />} />
        {/* <Route path="/product/:id" element={<ProductDetails />} /> */}
        {/* etc... */}

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin protected area */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="products/add" element={<AddProduct/>}/>
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="users" element={<UserManagement/>}/>
          <Route path="banner" element={<BannerManagement/>}/>
          <Route path="fixedbanner" element={<FixedBannerManager/>}/>
          <Route path="videos" element={<AdminVideos/>}/>
          <Route path="settings" element={<SettingsManager />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
};

export default App;
