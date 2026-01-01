import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag  } from "react-icons/fi";
import { FaShoppingBag,  } from "react-icons/fa";


const ProductCard = ({ product }) => {
  if (!product?.variants?.length) return null;

  // 🔥 flatten all sizes
  const allSizes = product.variants.flatMap(v => v.sizes || []);
  if (!allSizes.length) return null;

  const minPrice = Math.min(...allSizes.map(s => s.price));
  const maxMrp = Math.max(...allSizes.map(s => s.mrp));
  const hasDiscount = maxMrp > minPrice;

  const discountPercent = hasDiscount
    ? Math.round(((maxMrp - minPrice) / maxMrp) * 100)
    : 0;

  const primaryImage = product.variants[0]?.images?.[0]?.url;
  const hoverImage = product.variants[0]?.images?.[1]?.url;

  const [imgSrc, setImgSrc] = useState(primaryImage);

  return (
    <article className="group bg-white rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition">
      {/* IMAGE */}
      <div
        className="relative"
        onMouseEnter={() => hoverImage && setImgSrc(hoverImage)}
        onMouseLeave={() => setImgSrc(primaryImage)}
      >
        <Link to={`/product/${product.slug}`}>
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-[260px] object-cover transition-all duration-300"
          />
        </Link>

        {/* DISCOUNT TAG */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-white text-blue-700
                           text-[11px] font-semibold px-2 py-1 rounded">
            {discountPercent}% OFF
          </span>
        )}

        {/* WISHLIST */}
        <button
          className="absolute top-3 right-3 bg-white p-2 rounded-full
                     shadow hover:text-red-500 transition"
        >
          <FiHeart size={14} />
        </button>

        {/* QUICK ADD (DESKTOP ONLY) */}
        <div
  className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2
             opacity-0 group-hover:opacity-100 transition-opacity duration-300"
>
  <button
    className="flex items-center gap-1.5
               bg-white/30 backdrop-blur-md
               text-slate-900 border border-white/40
               px-3 py-1.5 text-[11px] font-medium
               rounded-md shadow-sm
               hover:bg-white/40 hover:border-white/60
               transition"
  >
    <FaShoppingBag size={12} />
    Add to cart
  </button>
</div>

      </div>

      {/* INFO */}
      <div className="px-3 pt-3 pb-4 space-y-1">
        {/* BRAND */}
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          {product.brand}
        </p>

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
            <span className="text-slate-400">
              ({product.ratingsCount})
            </span>
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
    </article>
  );
};

export default ProductCard;
