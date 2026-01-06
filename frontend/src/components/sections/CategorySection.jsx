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
            (c) => !c.parent || c.level === 1
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

  if (loading || !categories.length) return null;

  return (
    <section className="w-full bg-white py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Curated collections for every style
            </p>
          </div>

          {/* ARROWS */}
          {categories.length > 4 && (
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

        {/* ================= FULL WIDTH CAROUSEL ================= */}
        <Swiper
          modules={[Autoplay, Navigation]}
          loop={categories.length > 4}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          speed={700}
          spaceBetween={24}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            0: {
              slidesPerView: 1.2,
            },
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4, // 🔥 EXACTLY 4 ON DESKTOP
            },
          }}
        >
          {categories.map((cat) => (
            <SwiperSlide key={cat._id}>
              <Link
                to={`/category/${cat.slug}`}
                className="group block  overflow-hidden
                bg-white border border-slate-200
                hover:shadow-xl transition"
              >
                {/* IMAGE */}
                <div className="relative h-full">
                  <img
                    src={cat.image?.url}
                    alt={cat.name}
                    className="w-full h-full object-cover
                    transition-transform duration-500
                    group-hover:scale-105"
                  />

                  {/* GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-t
                  from-black/60 via-black/20 to-transparent" />

                  {/* TEXT */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
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
      </div>
    </section>
  );
};

export default CategorySection;
