import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaEye, FaEyeSlash, FaEnvelope, FaPhone } from "react-icons/fa";
import api from "../api/axios.js"; // ✅ Axios instance

import Swal from "sweetalert2";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",       // ✅ backend expects 'name'
    email: "",
    password: "",
    phone: "",      // ✅ backend expects 'phone'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        name: form.name,         // ✅ correctly mapped
        email: form.email,
        password: form.password,
        phone: form.phone,
      };

      const res = await api.post("/auth/register", payload); // ✅ API request

      Swal.fire("Success!", "Registration successful ", "success");

      navigate("/login"); // ✅ redirect after success

    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Registration failed ",
        "error"
      );
      console.error("Register API Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen grid lg:grid-cols-2">

    {/* ================= LEFT PANEL ================= */}
    <div className="hidden lg:flex flex-col justify-center px-14
      bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-600 text-white"
    >
      <h1 className="text-4xl font-extrabold leading-tight">
        Create your account 🚀
      </h1>

      <p className="mt-4 text-blue-100 max-w-md">
        Join us to place orders faster, track deliveries, and download invoices
        anytime from your dashboard.
      </p>

      <ul className="mt-8 space-y-4 text-sm">
        <li className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white"></span>
          Quick & secure registration
        </li>
        <li className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white"></span>
          Order tracking & history
        </li>
        <li className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white"></span>
          Easy invoice downloads
        </li>
      </ul>

      <p className="mt-12 text-xs text-blue-200">
        © {new Date().getFullYear()} Your Brand. All rights reserved.
      </p>
    </div>

    {/* ================= RIGHT PANEL ================= */}
    <div className="flex items-center justify-center px-4">
      <aside className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">

        {/* TITLE */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">
            {loading ? "Creating your account…" : "Create an account"}
          </h2>
          <p className="text-sm text-slate-500">
            Fill in the details to get started
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Full Name
            </label>
            <div className="relative">
              <input
                onChange={handleChange}
                name="name"
                value={form.name}
                placeholder="Your name"
                className="w-full px-4 py-3 text-sm rounded-xl
                border border-slate-200 bg-slate-50
                focus:bg-white focus:border-indigo-600 outline-none"
                required
              />
              <FaUserCircle className="absolute right-4 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Email address
            </label>
            <div className="relative">
              <input
                onChange={handleChange}
                name="email"
                value={form.email}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm rounded-xl
                border border-slate-200 bg-slate-50
                focus:bg-white focus:border-indigo-600 outline-none"
                required
              />
              <FaEnvelope className="absolute right-4 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* PHONE */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Phone Number
            </label>
            <div className="relative">
              <input
                onChange={handleChange}
                name="phone"
                value={form.phone}
                type="tel"
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 text-sm rounded-xl
                border border-slate-200 bg-slate-50
                focus:bg-white focus:border-indigo-600 outline-none"
                required
              />
              <FaPhone className="absolute right-4 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Password
            </label>
            <div className="relative">
              <input
                onChange={handleChange}
                name="password"
                value={form.password}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm rounded-xl
                border border-slate-200 bg-slate-50
                focus:bg-white focus:border-indigo-600 outline-none"
                required
              />
              {showPassword ? (
                <FaEyeSlash
                  onClick={() => setShowPassword(false)}
                  className="absolute right-4 top-3.5 text-slate-400 cursor-pointer"
                />
              ) : (
                <FaEye
                  onClick={() => setShowPassword(true)}
                  className="absolute right-4 top-3.5 text-slate-400 cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2
              py-3 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-indigo-600 to-blue-600
              hover:from-indigo-700 hover:to-blue-700
              transition
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing…" : "Create Account"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </aside>
    </div>
  </div>
);

};

export default Register;
