import React, { useState, useEffect } from "react";

import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import api from "../../api/axios.js";

const RecentlyViewed = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const res = await api.get("/products");
        const allProducts = res.data.products || [];

        const viewed =
          JSON.parse(localStorage.getItem("recentlyViewed")) || [];

        const list = viewed
          .map((id) => allProducts.find((p) => p._id === id))
          .filter(Boolean)
          .slice(0, 5);

        setProducts(list);
      } catch (err) {
        console.error("Recently viewed fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, []);

  if (!loading && !products.length) return null;

  return (
    <section className="bg-indigo-50/40 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 🔹 Header */}
        <div className="mb-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            Recently Viewed
          </h2>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Continue exploring styles you checked out earlier.
          </p>
        </div>

        {/* 🔹 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
