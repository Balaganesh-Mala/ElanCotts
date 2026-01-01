import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkedAlt,
  FaSignOutAlt,
} from "react-icons/fa";

import Button from "../components/ui/button.jsx";
import api from "../api/axios.js";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          Swal.fire("Login Required", "Please login to continue", "info");
          navigate("/login");
          return;
        }

        const res = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        Swal.fire("Error", "Session expired. Please login again.", "error");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-4xl animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-300" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-300 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}


  if (!user) return null;

  /* ================= JSX ================= */
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* PROFILE HERO */}
        <section className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-3xl p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {user.name}
              </h1>
              <p className="text-indigo-100 text-sm mt-1">
                Welcome back 👋
              </p>
            </div>
          </div>
        </section>

        {/* INFO GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EMAIL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <FaEnvelope />
              <h3 className="font-semibold">Email</h3>
            </div>
            <p className="text-sm text-gray-700 break-all">
              {user.email}
            </p>
          </div>

          {/* PHONE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <FaPhoneAlt />
              <h3 className="font-semibold">Phone</h3>
            </div>
            <p className="text-sm text-gray-700">
              {user.phone || "Not added"}
            </p>
          </div>

          {/* ROLE */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <FaUser />
              <h3 className="font-semibold">Account Type</h3>
            </div>
            <p className="text-sm text-gray-700 capitalize">
              {user.role || "User"}
            </p>
          </div>
        </section>

        {/* ADDRESSES */}
        {user.addresses?.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaMapMarkedAlt className="text-indigo-600" />
              Saved Addresses
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses.map((a, i) => (
                <div
                  key={i}
                  className="border rounded-xl p-4 text-sm text-gray-700 bg-gray-50"
                >
                  <p className="font-medium">
                    {a.street}
                  </p>
                  <p className="text-gray-500 mt-1">
                    {a.city}, {a.state} – {a.pincode}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Phone: {a.phone}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACTIONS */}
        <section className="flex justify-end">
          <Button
            variant="destructive"
            className="flex items-center gap-2 px-8"
            onClick={() => {
              localStorage.clear();
              Swal.fire("Logged Out", "You have been logged out", "success");
              navigate("/login");
            }}
          >
            <FaSignOutAlt /> Logout
          </Button>
        </section>

      </div>
    </main>
  );
};

export default UserProfile;
