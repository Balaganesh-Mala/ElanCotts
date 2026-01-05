import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

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

  /* ================= LOADING SKELETON ================= */
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div>
            <div className="h-7 w-56 bg-slate-200 rounded" />
            <div className="h-4 w-72 bg-slate-200 rounded mt-3" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-9 bg-slate-200 rounded-full" />
            <div className="h-9 w-9 bg-slate-200 rounded-full" />
          </div>
        </div>

        <div className="flex gap-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-[260px] h-[340px] rounded-2xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* ================= HEADER ================= */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Explore Our Collections
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Premium fabrics & timeless styles
          </p>
        </div>

        {/* CUSTOM ARROWS */}
        {categories.length > 3 && (
          <div className="hidden md:flex gap-3">
            <button
              ref={prevRef}
              className="w-10 h-10 rounded-full border border-slate-300
                         flex items-center justify-center
                         hover:bg-indigo-600 hover:text-white transition"
            >
              <FiChevronLeft size={20} />
            </button>

            <button
              ref={nextRef}
              className="w-10 h-10 rounded-full border border-slate-300
                         flex items-center justify-center
                         hover:bg-indigo-600 hover:text-white transition"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ================= CAROUSEL ================= */}
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        speed={6000}
        loop={categories.length > 4}
        spaceBetween={24}
        slidesPerView="auto"
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
      >
        {[...categories, ...categories].map((cat, index) => (
          <SwiperSlide key={cat._id + index} className="!w-[260px]">
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
                  <h3 className="text-lg font-semibold">{cat.name}</h3>
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
