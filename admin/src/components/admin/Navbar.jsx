// src/components/admin/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Menu, X, User, LogOut, Store as StoreIcon } from "lucide-react";
import api from "../../services/api";
import Swal from "sweetalert2";

const Navbar = ({ open, setOpen }) => {
  const [settings, setSettings] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/settings");
        setSettings(res.data.settings || null); // store settings object
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch settings ❗", "error");
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <header className="w-full bg-white shadow-md px-4 md:px-6 py-3 flex justify-between items-center fixed top-0 left-0 z-[1000]">

      {/* LEFT → Company Logo + Store Name */}
      <div className="flex items-center gap-3">
        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-800"
        >
          {open ? <X size={26}/> : <Menu size={26}/>}
        </button>

        {/* STORE LOGO From DB OR DEFAULT STORE ICON */}
        {settings?.logo?.url ? (
          <img
            src={settings.logo.url}
            alt="storeLogo"
            className="w-9 h-9 md:w-10 md:h-10 rounded-lg object-cover border"
          />
        ) : (
          <StoreIcon className="w-9 h-9 md:w-10 md:h-10 text-gray-700"/>
        )}

        {/* STORE NAME */}
        <h1 className="text-base md:text-lg font-bold text-gray-900">
          {settings?.storeName || "MB Funky Zone"}
        </h1>
      </div>

      {/* RIGHT → Admin Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition border"
        >
          {/* Fallback Icon */}
          <User className="w-5 h-5 text-gray-800"/>
          
        </button>
        

        {profileOpen && (
          <div
            onMouseLeave={() => setProfileOpen(false)}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border shadow-lg p-3 space-y-2"
          >
            <div className="border-b pb-2">
              <p className="font-semibold text-sm">{settings?.admin?.name || "Admin Bala"}</p>
              <p className="text-xs text-gray-500">{settings?.admin?.email || "admin@example.com"}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:bg-gray-100 w-full p-2 rounded-lg text-sm transition"
            >
              <LogOut size={16}/> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
export default Navbar