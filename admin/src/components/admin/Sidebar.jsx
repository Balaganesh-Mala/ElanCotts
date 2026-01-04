// src/components/admin/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  List,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Store,
  X,
  ChevronDown,
  User,
  Flag
} from "lucide-react";

import api from "../../services/api";
import Swal from "sweetalert2";
import path from "path";

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);

  // Admin profile (from localStorage)
  const admin = JSON.parse(localStorage.getItem("admin")) || {
    name: "Admin User",
    email: "admin@example.com",
  };

  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/settings");
        setSettings(res.data.settings || null);
        
      } catch (err) {
        Swal.fire("Error", "Failed to load store settings ❗", "error");
      }
    })();
  }, []);

  const doLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const menu = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { label: "Products", icon: <Package size={18} />, path: "/admin/products" },
    { label: "Categories", icon: <List size={18} />, path: "/admin/categories" },
    { label: "Orders", icon: <ShoppingCart size={18} />, path: "/admin/orders" },
    { label: "Users", icon: <Users size={18} />, path: "/admin/users" },
    {label: "Banner",icon: <Flag size={18} />, path:"/admin/banner" },
    {label: "Fixed Banner",icon: <Flag size={18} />, path:"/admin/fixedbanner" },
    { label: "Settings", icon: <Settings size={18} />, path: "/admin/settings" },
    
  ];

  return (
    <>
      {/* ──────────────── DESKTOP SIDEBAR ──────────────── */}
      <aside className="bg-[#0B1120] text-white w-64 h-screen fixed top-0 left-0 z-[1000] hidden md:flex flex-col justify-between shadow-xl">
        
        {/* LOGO */}
        <div className="px-4 py-4 border-b border-gray-800 flex items-center gap-3">
          {settings?.logo?.url ? (
            <img
              src={settings.logo.url}
              alt="logo"
              className="w-10 h-10 rounded-lg object-cover border"
            />
          ) : (
            <Store className="w-8 h-8 text-gray-300" />
          )}
          <h1 className="text-lg font-bold">{settings?.storeName || "MB Funky Zone"}</h1>
        </div>

        {/* MENU */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {menu.map((m) => (
            <Link
              key={m.label}
              to={m.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                ${
                  location.pathname === m.path
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }
              `}
            >
              {m.icon}
              {m.label}
            </Link>
          ))}
        </nav>

        {/* ADMIN PROFILE */}
        <div className="px-4 pb-4 border-t border-gray-800 relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <div className="flex items-center gap-3">
              <User className="w-6 h-6" />
              <span className="text-sm">Profile</span>
            </div>
            <ChevronDown size={18} className={`${showProfile ? "rotate-180" : ""} transition`} />
          </button>

          {showProfile && (
            <div className="absolute bottom-16 left-4 w-[210px] bg-[#141a2c] p-3 rounded-xl shadow-xl border border-gray-700">
              <p className="text-sm font-semibold">{settings.storeName}</p>
              <p className="text-xs text-gray-300">{settings.supportEmail}</p>

              <button
                onClick={doLogout}
                className="mt-3 w-full flex items-center gap-2 bg-red-600 px-3 py-2 text-sm rounded-lg hover:bg-red-700 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ──────────────── MOBILE SIDEBAR ──────────────── */}
      <aside
        className={`bg-[#0B1120] text-white w-64 h-full fixed top-0 left-0 z-[2000] p-3 shadow-xl md:hidden transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-3 py-3 border-b border-gray-800">
          <h1 className="text-lg font-bold">{settings?.storeName || "MB Funky Zone"}</h1>
          <button onClick={() => setOpen(false)}>
            <X size={26} className="text-gray-300" />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-4 space-y-1">
          {menu.map((m) => (
            <Link
              key={m.label}
              to={m.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                ${
                  location.pathname === m.path
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }
              `}
            >
              {m.icon}
              {m.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={doLogout}
          className="flex items-center gap-3 bg-red-600 w-full px-4 py-3 rounded-xl mt-5 hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
