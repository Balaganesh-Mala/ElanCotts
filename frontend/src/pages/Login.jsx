import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import api from "../api/axios.js"; // ✅ Axios instance with VITE baseURL

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = {
        email: form.email,
        password: form.password,
      };

      const res = await api.post("/auth/login", payload); // ✅ send to http://localhost:5000/api/auth/login

      // ✅ Save token & user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      Swal.fire("Success!", "Login successful", "success");

      navigate("/admin" ? "/admin" : "/"); // Example redirect logic you can adjust
      // You said redirect later for Cart click, so default to home for now
      navigate("/");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Login failed ", "error");
      console.error("Login API Error:", err.response?.data || err.message);
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
        Welcome Back 👋
      </h1>

      <p className="mt-4 text-blue-100 max-w-md">
        Log in to manage your orders, track deliveries, and access your invoices
        securely from one place.
      </p>

      {/* FEATURE LIST */}
      <ul className="mt-8 space-y-4 text-sm">
        <li className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white"></span>
          Secure & fast checkout experience
        </li>
        <li className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white"></span>
          Track your orders in real time
        </li>
        <li className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white"></span>
          Download GST invoices anytime
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
            {loading ? "Logging you in…" : "Login to your account"}
          </h2>
          <p className="text-sm text-slate-500">
            Please enter your credentials
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Email address
            </label>
            <div className="relative">
              <input
                onChange={handleChange}
                name="email"
                type="email"
                value={form.email}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm rounded-xl
                border border-slate-200 bg-slate-50
                focus:bg-white focus:border-indigo-600 outline-none"
                required
              />
              <FaEnvelope className="absolute right-4 top-3.5 text-slate-400" />
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
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* REGISTER */}
        <p className="text-center text-xs text-slate-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </aside>
    </div>
  </div>
);

};

export default Login;
