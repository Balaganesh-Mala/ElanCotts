// src/components/admin/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminAuthContext } from "../../context/AdminAuthContext";

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AdminAuthContext);

  if (loading) return <div className="p-8 text-center">Checking access...</div>;

  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
};

export default ProtectedRoute;
