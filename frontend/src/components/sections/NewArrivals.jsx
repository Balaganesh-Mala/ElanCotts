import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";

import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import api from "../../api/axios.js";

const NewArrivals = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNewArrivals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/all");

      if (Array.isArray(res.data.products)) {
        const latest = res.data.products
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setProducts(latest);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewArrivals();
  }, []);

  return (
    <section className="bg-indigo-50/40 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 🔹 Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              New Arrivals
            </h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Fresh styles just dropped. Discover the latest designs crafted
              for modern comfort and everyday elegance.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-2 border border-indigo-600
                       text-indigo-600 px-6 py-2 rounded-full text-sm font-semibold
                       hover:bg-indigo-600 hover:text-white transition self-start sm:self-auto"
          >
            View all
            <FaAngleRight />
          </button>
        </div>

        {/* 🔹 Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.slice(0,10).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>

        {/* Empty State */}
        {!loading && !products.length && (
          <p className="text-center text-sm text-gray-500 py-10">
            No new arrivals at the moment. Please check back soon.
          </p>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
