import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaShoppingBag, FaUserCircle, FaTimes } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";

import { useCart } from "../../context/CartContext";
import api from "../../api/axios.js";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Orders", path: "/orders" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logo, setLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/settings/public");
        setLogo(res.data.settings?.logo?.url || "");
        setCompanyName(res.data.settings?.companyName || "ElanCotts");
      } catch (err) {
        console.error("Navbar settings load failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /* ================= AUTH CHECK ================= */
  const verifyUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const res = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return !!res.data.success;
    } catch {
      return false;
    }
  };

  const handleAvatarClick = async () => {
    const valid = await verifyUser();
    if (valid) {
      navigate("/profile");
    } else {
      Swal.fire("Login Required", "Please login to continue ❗", "info");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <>
      {/* ================= OVERLAY ================= */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* ===== LOGO + COMPANY NAME ===== */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <>
                <img
                  src={logo || "/logo.jpg"}
                  alt={companyName || "Company Logo"}
                  className="h-10 w-auto object-contain"
                />

                {/* Company Name (Desktop only) */}
                {companyName && (
                  <span className="hidden sm:block text-lg font-semibold text-gray-900 tracking-tight">
                    {companyName}
                  </span>
                )}
              </>
            )}
          </div>

          {/* ===== DESKTOP NAV ===== */}
          <ul className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  end
                  className={({ isActive }) =>
                    `relative pb-1 transition ${
                      isActive
                        ? "text-indigo-600 after:absolute after:left-0 after:-bottom-1 after:w-full after:border-b-2 after:border-indigo-600"
                        : "text-gray-700 hover:text-indigo-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ===== RIGHT ICONS ===== */}
          <div className="flex items-center gap-5">
            {/* USER */}
            <button onClick={handleAvatarClick} aria-label="Profile">
              <FaUserCircle className="text-2xl text-gray-600 hover:text-indigo-600 transition" />
            </button>

            {/* CART */}
            <button
              onClick={() => navigate("/cart")}
              className="relative"
              aria-label="Cart"
            >
              <FaShoppingBag className="text-2xl text-gray-600 hover:text-indigo-600 transition" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-2xl lg:hidden text-gray-700"
              aria-label="Open Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-xl z-50 p-6 transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
          <FaTimes
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl text-gray-600 hover:text-red-500 cursor-pointer"
          />
        </div>

        <ul className="flex flex-col gap-5 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.name} onClick={() => setMobileMenuOpen(false)}>
              <NavLink
                to={link.path}
                end
                className={({ isActive }) =>
                  `block transition ${
                    isActive
                      ? "text-indigo-600 font-semibold"
                      : "text-gray-700 hover:text-indigo-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}

          <li onClick={() => setMobileMenuOpen(false)}>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `block transition ${
                  isActive
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                }`
              }
            >
              Cart ({cartItems.length})
            </NavLink>
          </li>
        </ul>

        {/* MOBILE FOOTER */}
        <div className="mt-auto border-t pt-4 text-xs text-gray-500 space-y-1">
          <p>✔ Free Delivery</p>
          <p>✔ 7-day Replacement</p>
          <p>✔ Quality Assured</p>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
