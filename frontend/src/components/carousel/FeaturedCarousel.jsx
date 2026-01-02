import React, { useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { Loader2 } from "lucide-react";
import ProductCard from "../ui/ProductCard";
import api from "../../api/axios.js";

const FeaturedCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 🔹 Header */}
        <div className="mb-10 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            Featured Collections
          </h2>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Handpicked styles that define our signature look and quality.
          </p>
        </div>

        {/* 🔹 Loader */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation]}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={products.length > 5}
            spaceBetween={24}
            breakpoints={{
              320: { slidesPerView: 1.4 },
              480: { slidesPerView: 2.2 },
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
