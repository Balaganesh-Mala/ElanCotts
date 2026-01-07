import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import discountTagImg from "../../assets/images/discountTag.png";
import { FaStar, FaRegStar } from "react-icons/fa";

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

  const isBestSeller = product.isBestSeller === true;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white  
       hover:shadow-lg transition
      focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {/* ================= IMAGE ================= */}
      <div
        className="relative"
        onMouseEnter={() => hoverImage && setImgSrc(hoverImage)}
        onMouseLeave={() => setImgSrc(primaryImage)}
      >
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-[260px] object-cover transition-all duration-300 overflow-hidden"
        />

        {/* ================= TAGS ================= */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-0 z-20">
          {/* ✅ BEST SELLER — LEFT */}
          {isBestSeller ? (
            <span
              className="bg-gradient-to-r from-amber-500 to-orange-500
              text-white text-[11px] font-semibold
              px-3 py-0 rounded-r-full shadow-md h-5"
            >
              Best Seller
            </span>
          ) : (
            <span />
          )}

          {/* ✅ DISCOUNT — RIGHT */}
          {hasDiscount && (
            <div className="relative w-11 h-14  top-[-15px] mr-2">
              <img
                src={discountTagImg}
                alt={`${discountPercent}% OFF`}
                className="w-full h-full object-contain drop-shadow-md"
              />

              {/* TEXT OVER IMAGE */}
              <div
                className="absolute inset-0 flex flex-col
                items-center justify-center
                text-white font-bold leading-tight"
              >
                <span className="text-[10px]">{discountPercent}%</span>
                <span className="text-[8px]">OFF</span>
              </div>
            </div>
          )}
        </div>

        {/* ================= VIEW DETAILS ================= */}
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
            rounded-lg shadow hover:bg-white transition"
          >
            View Details
          </button>
        </div>
      </div>

      {/* ================= INFO ================= */}
      <div className="px-3 pt-3 pb-4 space-y-1">
        {product.brand && (
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
        )}

        <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          {/* COLORS COUNT */}
          <p className="text-[11px] text-slate-500">
            {product.variants.length} colour
            {product.variants.length > 1 ? "s" : ""} available
          </p>

          {/* RATINGS */}
          {product.ratingsAverage > 0 && (
            <div className="flex items-center gap-1 text-xs">
              {/* ⭐ STAR ICONS */}
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) =>
                  product.ratingsAverage >= star ? (
                    <FaStar key={star} className="text-amber-500" size={10} />
                  ) : (
                    <FaRegStar
                      key={star}
                      className="text-slate-300"
                      size={10}
                    />
                  )
                )}
              </div>

              {/* RATING VALUE */}
              <span className="ml-0 text-slate-600 font-medium">
                {product.ratingsAverage.toFixed(1)}
              </span>

              {/* RATING COUNT */}
              <span className="text-slate-400">({product.ratingsCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
