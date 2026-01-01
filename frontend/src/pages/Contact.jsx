import React, { useEffect, useState } from "react";
import axios from "../api/axios";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";

import { BiSupport } from "react-icons/bi";
import { GrSecure } from "react-icons/gr";
import { VscWorkspaceTrusted } from "react-icons/vsc";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [settings, setSettings] = useState({
    storeName: "",
    supportPhone: "",
    supportEmail: "",
    address: "",
    logo: null,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/settings/public");
        setSettings(res.data.settings || {});
      } catch (err) {
        console.log("Failed to load store settings:", err);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 py-14">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Contact Us
          </h1>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Have questions? We’re here to help. Reach out and our team will get
            back to you shortly.
          </p>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT – CONTACT INFO */}
          <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              {settings.storeName || "Our Store"}
            </h2>

            {/* INFO ITEM */}
            <InfoItem
              icon={<FaPhoneAlt />}
              title="Call Us"
              value={settings.supportPhone || "Not available"}
            />

            <InfoItem
              icon={<FaEnvelope />}
              title="Email Us"
              value={settings.supportEmail || "Not available"}
            />

            <InfoItem
              icon={<FaMapMarkerAlt />}
              title="Visit Us"
              value={settings.address || "Not available"}
            />

            {/* TRUST BADGES */}
            <div className="pt-6 border-t text-xs text-gray-600 space-y-2">
              <TrustItem icon={<BiSupport />} text="24/7 Customer Support" />
              <TrustItem icon={<GrSecure />} text="Secure & Reliable Communication" />
              <TrustItem icon={<VscWorkspaceTrusted />} text="Trusted Online Store" />
            </div>
          </div>

          {/* RIGHT – CONTACT FORM */}
          <div className="bg-white border rounded-3xl p-8 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />

              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                className="w-full bg-gray-50 border rounded-2xl px-4 py-3 text-sm h-32 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- SUB COMPONENTS ---------------- */

const InfoItem = ({ icon, title, value }) => (
  <div className="flex items-start gap-4">
    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-600 leading-relaxed">{value}</p>
    </div>
  </div>
);

const TrustItem = ({ icon, text }) => (
  <p className="flex items-center gap-2">
    <span className="text-indigo-600">{icon}</span>
    {text}
  </p>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full bg-gray-50 border rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
    required
  />
);

export default Contact;
