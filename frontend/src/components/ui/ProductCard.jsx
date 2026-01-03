import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  if (!product?.variants?.length) return null;

  /* ===== PRICE CALC ===== */
  const allSizes = product.variants.flatMap((v) => v.sizes || []);
  if (!allSizes.length) return null;

  const minPrice = Math.min(...allSizes.map((s) => s.price));
  const maxMrp = Math.max(...allSizes.map((s) => s.mrp));
  const hasDiscount = maxMrp > minPrice;

  const discountPercent = hasDiscount
    ? Math.round(((maxMrp - minPrice) / maxMrp) * 100)
    : 0;

  /* ===== IMAGES ===== */
  const primaryImage = product.variants[0]?.images?.[0]?.url;
  const hoverImage = product.variants[0]?.images?.[1]?.url;
  const [imgSrc, setImgSrc] = useState(primaryImage);

  /* ✅ BEST SELLER FLAG (CORRECT) */
  const isBestSeller = product.isBestSeller === true;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden
        border border-slate-200 hover:shadow-lg transition
        focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {/* IMAGE */}
      <div
        className="relative"
        onMouseEnter={() => hoverImage && setImgSrc(hoverImage)}
        onMouseLeave={() => setImgSrc(primaryImage)}
      >
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-[260px] object-cover transition-all duration-300"
        />

        {/* ✅ BEST SELLER TAG */}
        {isBestSeller && (
          <div className="absolute top-3 left-0">
            <span
              className="bg-gradient-to-r from-amber-500 to-orange-500
        text-white text-[11px] font-semibold
        px-3 py-1 rounded-r-full shadow"
            >
              Best Seller
            </span>
          </div>
        )}

        {/* DISCOUNT TAG */}
        {hasDiscount && (
          <span
            className={`absolute top-3 ${
              isBestSeller ? "left-28" : "left-3"
            } bg-white text-indigo-700
            text-[11px] font-semibold px-2 py-1 rounded`}
          >
            {discountPercent}% OFF
          </span>
        )}

        {/* VIEW DETAILS BUTTON */}
        <div
          className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2
            opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/product/${product.slug}`);
            }}
            className="flex items-center gap-2
              bg-white/90 backdrop-blur
              text-slate-900 border border-white
              px-4 py-2 text-xs font-semibold
              rounded-lg shadow
              hover:bg-white transition"
          >
            View Details
          </button>
        </div>
      </div>

      {/* INFO */}
      <div className="px-3 pt-3 pb-4 space-y-1">
        {/* BRAND */}
        {product.brand && (
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
        )}

        {/* NAME */}
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
          {product.name}
        </h3>

        {/* RATING */}
        {product.ratingsAverage > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-amber-500">★</span>
            <span className="text-slate-600">
              {product.ratingsAverage.toFixed(1)}
            </span>
            <span className="text-slate-400">({product.ratingsCount})</span>
          </div>
        )}

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-slate-900">
            ₹{minPrice.toLocaleString()}
          </span>

          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">
              ₹{maxMrp.toLocaleString()}
            </span>
          )}
        </div>

        {/* COLOR COUNT */}
        <p className="text-[11px] text-slate-500 mt-1">
          {product.variants.length} colours available
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
