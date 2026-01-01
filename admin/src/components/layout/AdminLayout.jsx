import React, { useEffect, useState } from "react";
import Sidebar from "../admin/Sidebar.jsx";
import Navbar from "../admin/Navbar.jsx";
import { Outlet } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Store } from "lucide-react";

const AdminLayout = () => {
  const [open, setOpen] = useState(false); // for mobile sidebar toggle
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/settings");
        setSettings(res.data.settings || null);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load store settings ❗", "error");
      }
    })();
  }, []);

  return (
    <div className="flex">
      {/* -------- DESKTOP SIDEBAR (ALWAYS VISIBLE) -------- */}
      <aside className="hidden md:block">
        <Sidebar open={true} />
      </aside>

      {/* -------- MOBILE SIDEBAR (TOGGLABLE) -------- */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* -------- MAIN CONTENT -------- */}
      <main
        className="flex-1 min-h-screen ml-0 md:ml-64 transition-all duration-300"
      >
        {/* Fixed Navbar */}
        <Navbar open={open} setOpen={setOpen} />

        {/* 🟦 Added Top space (mt-20) so content is not hidden under navbar */}
        <section className="p-4 md:p-6 mt-20">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
