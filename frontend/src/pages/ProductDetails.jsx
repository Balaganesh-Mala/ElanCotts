import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

import api from "../api/axios";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCartBackend } = useCart();

  /* ================= STATE ================= */
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomStyle, setZoomStyle] = useState({});

  const [activeColor, setActiveColor] = useState(null);
  const [activeSize, setActiveSize] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [qty, setQty] = useState(1);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        const p = res.data.product;

        if (!p || !p.variants?.length) {
          throw new Error("Invalid product");
        }

        setProduct(p);

        const firstVariant = p.variants[0];
        setActiveColor(firstVariant);
        setSelectedImg(firstVariant.images?.[0]?.url || null);
        setActiveSize(firstVariant.sizes?.[0] || null);
      } catch {
        Swal.fire("Error", "Product not found", "error");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, navigate]);

  useEffect(() => {
    setQty(1);
  }, [activeSize]);

  /* ================= DERIVED ================= */
  const price = activeSize?.price ?? 0;
  const mrp = activeSize?.mrp ?? 0;
  const stock = activeSize?.stock ?? 0;

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return Swal.fire("Login Required", "Please login", "warning").then(() =>
        navigate("/login")
      );
    }

    if (!activeColor || !activeSize) {
      return Swal.fire("Select Variant", "Choose color & size", "warning");
    }

    try {
      await addToCartBackend({
        productId: product._id,
        sku: activeSize.sku,
        quantity: qty,
      });

      Swal.fire("Added to Cart", "Product added successfully", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to add to cart",
        "error"
      );
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          {/* IMAGE SKELETON */}
          <div className="bg-slate-200 rounded-2xl h-[360px] lg:h-[440px]" />

          {/* CONTENT SKELETON */}
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-200 rounded" />

            <div className="h-5 w-32 bg-slate-200 rounded mt-4" />

            <div className="flex gap-3 mt-4">
              <div className="h-10 w-24 bg-slate-200 rounded-lg" />
              <div className="h-10 w-24 bg-slate-200 rounded-lg" />
            </div>

            <div className="h-12 w-full bg-slate-200 rounded-lg mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  /* ================= UI ================= */
  return (
    <section className="bg-white">
      {/* BACK */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ================= IMAGES ================= */}
        <div className="lg:sticky lg:top-24 self-start">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* THUMBNAILS */}
          <div
            className="order-2 lg:order-1 flex lg:flex-col gap-3
               overflow-x-auto lg:overflow-visible"
          >
            {activeColor?.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(img.url)}
                className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20
          rounded-lg border overflow-hidden transition
          ${
            selectedImg === img.url
              ? "border-indigo-600 ring-1 ring-indigo-600"
              : "border-slate-300 hover:border-slate-400"
          }`}
              >
                <img
                  src={img.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* MAIN IMAGE */}
          <div
            className="order-1 lg:order-2 relative flex-1
               rounded-2xl border overflow-hidden
               bg-slate-50"
            onMouseMove={(e) => {
              const { left, top, width, height } =
                e.currentTarget.getBoundingClientRect();

              const x = ((e.clientX - left) / width) * 100;
              const y = ((e.clientY - top) / height) * 100;

              setZoomStyle({
                transform: "scale(1.8)",
                transformOrigin: `${x}% ${y}%`,
              });
            }}
            onMouseLeave={() => setZoomStyle({})}
          >
            <img
              src={selectedImg}
              alt={product.name}
              className="w-full h-[300px] sm:h-[360px] lg:h-[440px]
                 object-cover transition-transform duration-200"
              style={zoomStyle}
            />
          </div>
        </div>
        </div>

        {/* ================= INFO ================= */}
        <div className="space-y-6">
          {/* TITLE + RATING */}
          <div className="space-y-2">
            {/* PRODUCT NAME */}
            <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* SHORT DESCRIPTION */}
            {product.shortDescription && (
              <p className="text-sm text-slate-500 leading-snug line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* RATING + COUNT */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-sm">
                    {i <= Math.round(product.ratingsAverage) ? "★" : "☆"}
                  </span>
                ))}
              </div>

              <span className="text-slate-500">
                {product.ratingsAverage.toFixed(1)}
              </span>

              <span className="text-slate-400">•</span>

              <span className="text-slate-500 hover:text-indigo-700 cursor-pointer">
                {product.ratingsCount} reviews
              </span>
            </div>
          </div>

          {/* PRICE + CTA INLINE */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Price</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  ₹{price}
                </span>
                {mrp > price && (
                  <span className="text-sm line-through text-slate-400">
                    ₹{mrp}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SIZE */}
          {activeColor && (
            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium text-slate-500">Size</p>

              <div className="flex gap-2 flex-wrap">
                {activeColor.sizes?.map((size) => {
                  const isSelected = activeSize?.sku === size.sku;

                  return (
                    <button
                      key={size.sku}
                      disabled={size.stock === 0}
                      onClick={() => setActiveSize(size)}
                      className={`min-w-[44px] px-3 py-2 text-sm border rounded-lg transition
              ${
                isSelected
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600 hover:border-slate-400"
              }
              ${size.stock === 0 && "opacity-30 cursor-not-allowed"}
            `}
                    >
                      {size.size}
                    </button>
                  );
                })}
              </div>

              {/* STOCK INFO */}
              {activeSize && (
                <p className="text-xs text-slate-500">
                  {activeSize.stock > 0
                    ? `${activeSize.stock} available`
                    : "Out of stock"}
                </p>
              )}
            </div>
          )}
          {/* VARIANTS */}
          {/* COLOR (MINI IMAGE + LABEL) */}
          <div className="flex items-start gap-3">
            <div className="flex gap-3 flex-wrap">
              {product.variants.map((variant) => {
                const isActive = activeColor?._id === variant._id;
                const previewImg = variant.images?.[0]?.url;

                return (
                  <button
                    key={variant._id}
                    onClick={() => {
                      setActiveColor(variant);
                      setSelectedImg(previewImg || null);
                      setActiveSize(variant.sizes?.[0] || null);
                    }}
                    className="flex flex-col items-center gap-1 text-xs"
                  >
                    <div
                      className={`w-12 h-12 rounded-md overflow-hidden border transition
              ${
                isActive
                  ? "border-indigo-700 ring-1 ring-indigo-700"
                  : "border-slate-300 hover:border-slate-400"
              }`}
                    >
                      {previewImg ? (
                        <img
                          src={previewImg}
                          alt={variant.color}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          {variant.color}
                        </div>
                      )}
                    </div>

                    <span
                      className={`${
                        isActive
                          ? "text-indigo-700 font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      {variant.color}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm font-medium text-slate-700">Qty</span>
            <div className="flex items-center border rounded-full">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-1"
              >
                −
              </button>
              <span className="px-4">{qty}</span>
              <button
                disabled={qty >= stock}
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-1 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ADD TO CART */}
            <button
              disabled={!activeSize || stock === 0}
              onClick={handleAddToCart}
              className="w-full border border-blue-700 text-blue-700
      bg-blue-50 py-3 rounded-lg text-sm font-semibold
      hover:bg-blue-100 transition
      disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>

            {/* BUY NOW */}
            <button
              disabled={!activeSize || stock === 0}
              onClick={() => {
                handleAddToCart();
                navigate("/checkout", {
                  state: {
                    buyNow: true,
                    product: product._id,
                    sku: activeSize?.sku,
                    quantity: qty,
                  },
                });
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg
      text-sm font-semibold hover:bg-blue-700 transition
      disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {/* ACCORDION – PRODUCT DETAILS */}
          <details className="group border-t pt-4">
            <summary
              className="cursor-pointer list-none flex items-center justify-between
               text-sm font-medium text-slate-900"
            >
              <span>Product Details</span>

              <FiChevronDown
                className="text-slate-500 transition-transform duration-300
                 group-open:rotate-180"
                size={18}
              />
            </summary>

            <div className="mt-4 space-y-2 text-sm">
              {[
                ["Brand", product.brand],
                ["Fabric", product.attributes?.fabric],
                ["Fit", product.attributes?.fit],
                ["Sleeve", product.attributes?.sleeve],
                ["Occasion", product.attributes?.occasion],
                ["Made In", product.attributes?.countryOfOrigin],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between
                 border-b border-slate-100 pb-1 last:border-none"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </details>

          {/* ACCORDION – DESCRIPTION */}
          <details className="group border-t pt-4">
            <summary
              className="cursor-pointer list-none flex items-center justify-between
               text-sm font-medium text-slate-900"
            >
              <span>Description</span>

              <FiChevronDown
                className="text-slate-500 transition-transform duration-300
                 group-open:rotate-180"
                size={18}
              />
            </summary>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              {product.longDescription}
            </p>
          </details>

          {/* STOCK + POLICY */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            {product.returnPolicy?.isReturnable && (
              <span>{product.returnPolicy.returnDays}-day returns</span>
            )}

            {product.shipping?.codAvailable && <span>COD available</span>}
          </div>
        </div>
      </div>

      {/* ================= REVIEWS ================= */}
      <div className="max-w-7xl mx-auto px-4 py-10 border-t space-y-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>

        {product.reviews.length === 0 && (
          <p className="text-sm text-gray-500">
            No reviews yet. Be the first to review this product.
          </p>
        )}

        {product.reviews.map((review) => (
          <div key={review._id} className="border rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{review.name}</p>
                {review.verifiedPurchase && (
                  <span className="text-xs text-green-600">
                    ✔ Verified Purchase
                  </span>
                )}
              </div>

              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={
                      i <= review.rating ? "text-yellow-400" : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {review.comment && (
              <p className="text-sm text-gray-700">{review.comment}</p>
            )}

            {review.images?.length > 0 && (
              <div className="flex gap-2 pt-2">
                {review.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt="review"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductDetails;
