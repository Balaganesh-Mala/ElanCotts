import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../api/axios";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (res.data?.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error("Category fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!categories.length) return null;

  const featured = categories.slice(0, 6);
  const remaining = categories.slice(6);

  const useHeroLayout = featured.length > 3;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* ================= HEADER ================= */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-indigo-700">
          Explore Our Collections
        </h2>
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">
          Premium fabrics, modern fits, and timeless styles by Elan Cotts.
        </p>
      </div>

      {/* ================= FEATURED ================= */}
      <div
        className={`mt-16 grid gap-8 ${
          featured.length === 1
            ? "grid-cols-1"
            : featured.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        {featured.map((cat, index) => (
          <Link
            key={cat._id}
            to={`/category/${cat.slug}`}
            className={`relative rounded-2xl overflow-hidden shadow-md group ${
              useHeroLayout && index === 0
                ? "md:col-span-2 h-[360px]"
                : "h-[260px]"
            }`}
          >
            <img
              src={
                cat.image?.url ||
                "https://via.placeholder.com/600x400?text=Elan+Cotts"
              }
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <p className="text-xs opacity-90 line-clamp-2">
                {cat.description || "Discover our latest collection"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ================= MORE ================= */}
      {remaining.length > 0 && (
        <div className="mt-20">
          <h3 className="text-xl font-semibold text-indigo-700 mb-6">
            More Collections
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {remaining.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <img
                  src={
                    cat.image?.url ||
                    "https://via.placeholder.com/300x200?text=Elan+Cotts"
                  }
                  alt={cat.name}
                  className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="p-3 bg-white">
                  <p className="text-sm font-medium text-gray-800 text-center">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
