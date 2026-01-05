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
      const res = await api.get("/products/all");

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
    <section className="bg-white py-16 sm:py-20 border-t border-slate-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">

    {/* HEADER */}
    <div className="mb-8 sm:mb-10
      flex flex-col gap-4
      sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          Best Sellers
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Customer favorites crafted for comfort, fit, and everyday style.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/shop?filter=bestseller")}
        className="inline-flex items-center gap-2
          self-start sm:self-auto
          rounded-full px-5 py-2.5
          text-sm font-semibold
          border border-indigo-600 text-indigo-600
          hover:bg-indigo-600 hover:text-white
          transition-colors duration-200"
      >
        View all
        <FaAngleRight className="text-sm" />
      </button>
    </div>

    {/* GRID */}
    <div
      className="grid grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        gap-x-2 sm:gap-x-6
        gap-y-8 sm:gap-y-10"
    >
      {loading
        ? Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        : products.slice(0,10).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
    </div>
  </div>
</section>

  );
};

export default BestSeller;
