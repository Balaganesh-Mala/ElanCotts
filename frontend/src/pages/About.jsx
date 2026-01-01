import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  FaCheckCircle,
  FaUsers,
  FaTshirt,
  FaTruck,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";

const About = () => {
  const [settings, setSettings] = useState({
    storeName: "",
    logo: null,
    aboutText: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get("/settings/public");
        setSettings(res.data.settings || {});
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    loadSettings();
  }, []);

  return (
    <main className="bg-white">

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">
              About Us
            </p>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              {settings.storeName || "Our Clothing Brand"}
            </h1>

            <p className="mt-6 text-gray-600 text-base leading-relaxed max-w-xl">
              {settings.aboutText ||
                "We are a modern clothing brand dedicated to crafting high-quality, stylish, and comfortable apparel. Our goal is simple — make fashion effortless, reliable, and accessible for everyday life."}
            </p>

            <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium text-gray-700">
              <Badge text="Premium Fabrics" />
              <Badge text="Modern Fits" />
              <Badge text="Trusted Quality" />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-3xl border shadow-sm p-10 w-full max-w-md">
              <img
                src={settings.logo?.url || "/logo.jpg"}
                alt={settings.storeName}
                className="w-full h-48 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat value="10K+" label="Happy Customers" />
          <Stat value="250+" label="Products Designed" />
          <Stat value="5★" label="Customer Rating" />
          <Stat value="99%" label="Repeat Buyers" />
        </div>
      </section>

      {/* ================= OUR STORY ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-5">
            Our Story
          </h2>

          <p className="text-gray-600 leading-relaxed mb-4">
            Our journey began with a simple idea — create clothing that feels
            good, looks premium, and lasts longer than trends. We noticed a gap
            between affordability and quality, and decided to change that.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Every product we release goes through careful design, fabric
            selection, and quality checks. We believe fashion should enhance
            your lifestyle, not complicate it.
          </p>
        </div>

        <div className="bg-gray-100 rounded-3xl p-10 flex items-center">
          <ul className="space-y-4 text-sm text-gray-700">
            <li className="flex gap-2">
              <FaCheckCircle className="text-indigo-600 mt-1" />
              Designed for everyday comfort
            </li>
            <li className="flex gap-2">
              <FaCheckCircle className="text-indigo-600 mt-1" />
              Quality-first manufacturing
            </li>
            <li className="flex gap-2">
              <FaCheckCircle className="text-indigo-600 mt-1" />
              Honest pricing & transparency
            </li>
            <li className="flex gap-2">
              <FaCheckCircle className="text-indigo-600 mt-1" />
              Customer feedback driven improvements
            </li>
          </ul>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">
            Why Choose {settings.storeName || "Us"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <Feature
              icon={<FaTshirt />}
              title="Quality Apparel"
              text="Carefully selected fabrics with superior comfort and durability."
            />
            <Feature
              icon={<FaUsers />}
              title="Customer First"
              text="Designed around real needs and real lifestyles."
            />
            <Feature
              icon={<FaTruck />}
              title="Fast Delivery"
              text="Reliable shipping with safe and secure packaging."
            />
            <Feature
              icon={<FaShieldAlt />}
              title="Trusted Brand"
              text="Transparent policies and consistent product quality."
            />
          </div>
        </div>
      </section>

      {/* ================= EXPERIENCE ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        <FaStar className="text-indigo-600 text-3xl mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Designed for a Better Shopping Experience
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
          From browsing to checkout, every part of our platform is built to be
          smooth, secure, and user-friendly — so you can shop with confidence.
        </p>
      </section>
    </main>
  );
};

/* ================= SUB COMPONENTS ================= */

const Badge = ({ text }) => (
  <span className="px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
    {text}
  </span>
);

const Stat = ({ value, label }) => (
  <div>
    <p className="text-3xl font-extrabold text-indigo-600">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{label}</p>
  </div>
);

const Feature = ({ icon, title, text }) => (
  <div className="bg-white rounded-2xl border shadow-sm p-6 text-center hover:shadow-md transition">
    <div className="text-indigo-600 text-3xl mb-4 mx-auto">{icon}</div>
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
  </div>
);

export default About;
