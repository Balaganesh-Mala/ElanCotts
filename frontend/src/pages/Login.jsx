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
    <div className="min-h-screen flex items-center justify-center px-4">
      <aside className="bg-white w-full max-w-[420px] sm:max-w-[460px] rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center">
          {loading ? "Logging In..." : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="relative">
            <input
              onChange={handleChange}
              name="email"
              type="email"
              value={form.email}
              placeholder="Enter your email"
              className="w-full bg-gray-100 px-4 py-3 text-sm rounded-full outline-none border focus:border-black"
              required
            />
            <FaEnvelope className="absolute right-4 top-3.5 text-gray-400" />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              onChange={handleChange}
              name="password"
              value={form.password}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="w-full bg-gray-100 px-4 py-3 text-sm rounded-full outline-none border focus:border-black"
              required
            />
            {showPassword ? (
              <FaEyeSlash
                onClick={() => setShowPassword(false)}
                className="absolute right-4 top-4 text-gray-400 cursor-pointer"
              />
            ) : (
              <FaEye
                onClick={() => setShowPassword(true)}
                className="absolute right-4 top-4 text-gray-400 cursor-pointer"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Login"
            )}
          </button>

        </form>

        {/* Register Redirect */}
        <p className="text-center text-xs text-gray-600 font-medium">
          Don’t have an account?{" "}
          <Link to="/register" className="text-orange-500 font-bold hover:underline">
            Register
          </Link>
        </p>
      </aside>
    </div>
  );
};

export default Login;
