import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { getHeroSlides } from "../../api/hero.api";

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchSlides = async () => {
    try {
      const res = await getHeroSlides();
      const data = res.data.slides || [];

      const activeSorted = data
        .filter((s) => s.isActive)
        .sort((a, b) => a.order - b.order);

      setSlides(activeSorted);
    } catch (error) {
      console.error("Failed to load hero banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading banners...</p>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <p className="text-gray-500 text-lg">No banners available</p>
      </div>
    );
  }

  return (
    <section className="w-full mt-2">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        className="shadow-lg"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative">
              <img
                src={slide.image?.url}
                alt={slide.subtitle}
                className="w-full h-[450px] object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center space-y-4 px-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                <h4 className="text-lg md:text-xl text-white uppercase tracking-widest">
                  {slide.title}
                </h4>

                <h1 className="text-4xl md:text-6xl font-extrabold text-white">
                  {slide.subtitle}
                </h1>

                {slide.buttonText && (
                  <button
                    onClick={() => navigate("/shop")}
                    className="bg-white text-black px-6 py-3 font-semibold rounded-full hover:bg-gray-200 transition"
                  >
                    {slide.buttonText}
                  </button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroCarousel;
