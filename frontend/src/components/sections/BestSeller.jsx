import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa6";

import ProductCard from "../ui/ProductCard";
import ProductCardSkeleton from "../ui/ProductCardSkeleton";
import api from "../../api/axios"; // ✅ public API only

const BestSeller = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBestSellers = async () => {
    try {
      setLoading(true);

      // ✅ PUBLIC products endpoint
      const res = await api.get("/products");

      const allProducts = res.data.products || [];

      // ✅ Frontend-based bestseller logic
      const bestSellerProducts = allProducts
        .filter((product) => product.isBestSeller === true)
        .slice(0, 10);

      setProducts(bestSellerProducts);
    } catch (err) {
      console.error("BestSeller fetch error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBestSellers();
  }, []);

  // ✅ Hide section if nothing to show
  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-white py-20 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Best Sellers
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Customer favorites crafted for comfort, fit, and everyday style.
            </p>
          </div>

          <button
            onClick={() => navigate("/shop?filter=bestseller")}
            className="inline-flex items-center gap-2
                       border border-indigo-600 text-indigo-600
                       px-6 py-2 rounded-lg text-sm font-semibold
                       hover:bg-indigo-600 hover:text-white transition"
          >
            View all
            <FaAngleRight />
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
