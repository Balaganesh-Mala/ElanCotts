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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-[420px] sm:max-w-[460px] rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">

        <h2 className="text-2xl font-extrabold text-gray-900 text-center">
          {loading ? "Registering..." : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="relative">
            <input
              onChange={handleChange}
              name="name"
              value={form.name}
              placeholder="Enter user name"
              className="w-full bg-gray-100 px-4 py-3 text-sm rounded-full outline-none border focus:border-black"
              required
            />
            <FaUserCircle className="absolute right-4 top-3.5 text-gray-400" />
          </div>

          {/* Email */}
          <div className="relative">
            <input
              onChange={handleChange}
              name="email"
              value={form.email}
              type="email"
              placeholder="Enter your email"
              className="w-full bg-gray-100 px-4 py-3 text-sm rounded-full outline-none border focus:border-black"
              required
            />
            <FaEnvelope className="absolute right-4 top-3.5 text-gray-400" />
          </div>

          {/* Phone */}
          <div className="relative">
            <input
              onChange={handleChange}
              name="phone"
              value={form.phone}
              type="tel"
              placeholder="Enter phone number"
              className="w-full bg-gray-100 px-4 py-3 text-sm rounded-full outline-none border focus:border-black"
              required
            />
            <FaPhone className="absolute right-4 top-3.5 text-gray-400" />
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
            {loading ? "Processing..." : "Register"}
          </button>

        </form>

        {/* Login Redirect */}
        <p className="text-center text-xs text-gray-600 font-medium">
          Have an account?{" "}
          <Link to="/login" className="text-orange-500 font-bold hover:underline">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
