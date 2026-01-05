import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Loader2 } from "lucide-react";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const swiperRef = useRef(null);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (res.data?.success) {
          const parents = (res.data.categories || []).filter(
            (c) => c.parent === null || c.level === 1
          );
          setCategories(parents);
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
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* HEADER SKELETON */}
      <div className="flex items-center justify-between mb-8 animate-pulse">
        <div>
          <div className="h-7 w-56 bg-slate-200 rounded-md" />
          <div className="h-4 w-72 bg-slate-200 rounded mt-3" />
        </div>

        <div className="flex gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200" />
          <div className="h-9 w-9 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* CAROUSEL SKELETON */}
      <div className="flex gap-6 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-[260px] flex-shrink-0 rounded-2xl
                       overflow-hidden bg-white shadow-md"
          >
            {/* IMAGE */}
            <div className="h-[340px] bg-slate-200 animate-pulse relative">
              {/* SHIMMER */}
              <div
                className="absolute inset-0
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                animate-shimmer"
              />
            </div>

            {/* TEXT */}
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


  if (!categories.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Explore Our Collections
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Premium fabrics & timeless styles
          </p>
        </div>

        {/* CUSTOM ARROWS */}
        <div className="flex gap-3">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="p-2 rounded-full border border-slate-300
                       hover:bg-indigo-600 hover:text-white
                       transition"
          >
            <FiChevronLeft size={20} />
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="p-2 rounded-full border border-slate-300
                       hover:bg-indigo-600 hover:text-white
                       transition"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ================= CAROUSEL ================= */}
      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        speed={6000}
        loop
        slidesPerView="auto"
        spaceBetween={24}
      >
        {[...categories, ...categories].map((cat, index) => (
          <SwiperSlide
            key={cat._id + index}
            className="!w-[260px]"
          >
            <Link
              to={`/category/${cat.slug}`}
              className="block rounded-2xl overflow-hidden
                         bg-white shadow-md hover:shadow-lg transition"
            >
              {/* IMAGE */}
              <div className="relative h-[340px]">
                <img
                  src={cat.image?.url}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/20" />

                {/* TEXT */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-semibold">
                    {cat.name}
                  </h3>
                  <p className="text-xs opacity-90 mt-1">
                    Explore Collection →
                  </p>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CategorySection;
