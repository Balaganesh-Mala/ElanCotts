import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../ui/ProductCard";
import api from "../../api/axios.js";

const FeaturedCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/all");

      if (Array.isArray(res.data.products)) {
        const featured = res.data.products.filter(
          (p) => p.isFeatured === true
        );
        setProducts(featured.slice(0, 12));
      }
    } catch (err) {
      console.error("Featured Product Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  if (!loading && !products.length) return null;

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">

        {/* ================= HEADER ================= */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Featured Collections
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Handpicked styles that define our signature look
            </p>
          </div>

          {/* CUSTOM ARROWS */}
          {!loading && products.length > 4 && (
            <div className="hidden md:flex gap-3">
              <button
                ref={prevRef}
                className="w-10 h-10 rounded-full border border-slate-300
                flex items-center justify-center
                hover:bg-slate-100 transition"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                ref={nextRef}
                className="w-10 h-10 rounded-full border border-slate-300
                flex items-center justify-center
                hover:bg-slate-100 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* ================= LOADER ================= */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={products.length > 5}
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
              320: { slidesPerView: 1.3 },
              480: { slidesPerView: 2.1 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 3.5 },
              1024: { slidesPerView: 4.2 },
              1280: { slidesPerView: 5 },
            }}
            className="!pb-4"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default FeaturedCarousel;
