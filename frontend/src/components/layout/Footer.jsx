import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import api from "../../api/axios";

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState(null); // "links" | "support"

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get("/settings/public");
        setSettings(res.data.settings || null);
      } catch (err) {
        console.error("Footer settings error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* ================= BRAND ================= */}
          <div>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <div className="flex items-center gap-3 mb-4">
                {settings?.logo?.url && (
                  <img
                    src={settings.logo.url}
                    alt={settings.companyName || "Company Logo"}
                    className="h-10 w-auto object-contain"
                  />
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {settings?.companyName || "ElanCotts"}
                </h3>
              </div>
            )}

            <p className="text-sm text-gray-600 leading-relaxed">
              Premium clothing crafted with quality fabrics, modern fits,
              and timeless design — made for everyday confidence and comfort.
            </p>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div>
            <button
              onClick={() =>
                setOpenSection(openSection === "links" ? null : "links")
              }
              className="w-full flex justify-between items-center
                font-semibold text-gray-900 mb-4
                md:cursor-default md:pointer-events-none"
            >
              Quick Links
              <span className="md:hidden text-lg">
                {openSection === "links" ? "−" : "+"}
              </span>
            </button>

            <ul
              className={`space-y-2 text-sm text-gray-600
                ${openSection === "links" ? "block" : "hidden"} md:block`}
            >
              <li><Link to="/" className="hover:text-indigo-600">Home</Link></li>
              <li><Link to="/shop" className="hover:text-indigo-600">Shop</Link></li>
              <li><Link to="/about" className="hover:text-indigo-600">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600">Contact Us</Link></li>
            </ul>
          </div>

          {/* ================= CUSTOMER SUPPORT ================= */}
          <div>
            <button
              onClick={() =>
                setOpenSection(openSection === "support" ? null : "support")
              }
              className="w-full flex justify-between items-center
                font-semibold text-gray-900 mb-4
                md:cursor-default md:pointer-events-none"
            >
              Customer Support
              <span className="md:hidden text-lg">
                {openSection === "support" ? "−" : "+"}
              </span>
            </button>

            <ul
              className={`space-y-2 text-sm text-gray-600
                ${openSection === "support" ? "block" : "hidden"} md:block`}
            >
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Returns & Refunds</li>
              <li>Shipping Information</li>
              <li>FAQs</li>
            </ul>
          </div>

          {/* ================= SOCIAL ================= */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Follow Us
            </h4>

            <p className="text-sm text-gray-600 mb-4">
              Stay updated with our latest collections and exclusive offers.
            </p>

            <div className="flex space-x-4 text-xl text-gray-600">
              <a href={settings?.socialLinks?.facebook || "#"} target="_blank" rel="noreferrer">
                <FaFacebook className="hover:text-indigo-600 transition" />
              </a>
              <a href={settings?.socialLinks?.instagram || "#"} target="_blank" rel="noreferrer">
                <FaInstagram className="hover:text-indigo-600 transition" />
              </a>
              <a href={settings?.socialLinks?.twitter || "#"} target="_blank" rel="noreferrer">
                <FaTwitter className="hover:text-indigo-600 transition" />
              </a>
              <a href={settings?.socialLinks?.linkedin || "#"} target="_blank" rel="noreferrer">
                <FaLinkedin className="hover:text-indigo-600 transition" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="text-center text-xs text-gray-500 border-t py-4 bg-gray-100">
        © {new Date().getFullYear()} {settings?.companyName || "ElanCotts"}.
        All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
