import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";

import {
  FiShoppingCart,
  FiUser,
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiInfo,
  FiPhone,
} from "react-icons/fi";
import Swal from "sweetalert2";

import { useCart } from "../../context/CartContext";
import api from "../../api/axios";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "My Orders", path: "/orders" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const navIconMap = {
  Home: FiHome,
  Shop: FiPackage,
  "My Orders": FiShoppingBag,
  About: FiInfo,
  Contact: FiPhone,
};
const Navbar = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart(); // ✅ FIX

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const [mobileOpen, setMobileOpen] = useState(false);
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

  /* ================= USER CHECK ================= */
  const handleProfileClick = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Login Required", "Please login to continue", "info");
      return navigate("/login");
    }

    try {
      await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/profile");
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <>
      {/* OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            {loading ? (
              <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <img
                  src={logo || "/logo.jpg"}
                  alt="logo"
                  className="h-9 object-contain"
                />
                <span className=" sm:block text-lg font-semibold tracking-wide">
                  {companyName}
                </span>
              </>
            )}
          </div>

          {/* DESKTOP NAV */}
          <ul className="hidden lg:flex items-center gap-3 text-sm font-medium bg-indigo-50 rounded-full px-2 py-2">
            {navLinks.map((link) => {
              const Icon = navIconMap[link.name];

              return (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `
            flex items-center gap-2
            px-4 py-2 rounded-full
            transition-all duration-300
            ${
              isActive
                ? "bg-indigo-600/10 text-indigo-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }
          `
                    }
                  >
                    {/* ICON ONLY WHEN ACTIVE */}
                    {({ isActive }) => (
                      <>
                        {isActive && Icon && <Icon size={16} />}
                        <span className="whitespace-nowrap">{link.name}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* RIGHT ICONS (DESKTOP ONLY) */}
          <div className="hidden lg:flex items-center gap-5">
            {/* USER */}
            <button
              onClick={handleProfileClick}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FiUser className="w-5 h-5 text-gray-700" />
            </button>

            {/* CART */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FiShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* MOBILE MENU BUTTON (ONLY) */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Menu className="w-7 h-7 text-gray-800" />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU (SHEET STYLE, NOT SIDE DRAWER) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ${
          mobileOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <X
            onClick={() => setMobileOpen(false)}
            className="w-6 h-6 cursor-pointer"
          />
        </div>

        <ul className="px-6 py-6 space-y-5 text-base font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block py-2 ${
                    isActive ? "text-indigo-600 font-semibold" : "text-gray-700"
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}

          <li>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleProfileClick();
              }}
              className="w-full text-left py-2 text-gray-700"
            >
              Profile
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
