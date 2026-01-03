import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { getHeroSlides } from "../../api/hero.api";

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= LOAD SLIDES ================= */
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await getHeroSlides();
        const data = res.data.slides || [];

        const activeSorted = data
          .filter((s) => s.isActive)
          .sort((a, b) => a.order - b.order);

        setSlides(activeSorted);
      } catch (err) {
        console.error("Hero banner error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  /* ================= CTA HANDLER ================= */
  const handleCTA = (slide) => {
    if (!slide?.link) return;

    if (slide.linkType === "EXTERNAL") {
      window.open(slide.link, "_blank");
    } else if (slide.linkType === "ANCHOR") {
      document.querySelector(slide.link)?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      navigate(slide.link);
    }
  };

  /* ================= LOADING SKELETON ================= */
  if (loading) {
    return (
      <div className="w-full h-[420px] bg-slate-200 animate-pulse rounded-xl mx-auto max-w-7xl" />
    );
  }

  if (!slides.length) return null;

  return (
    <section className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true }}
        className="w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative w-full h-[360px] sm:h-[420px] md:h-[520px]">
              {/* IMAGE */}
              <img
                src={slide.image?.url}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* CONTENT */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                  <div className="max-w-xl text-white space-y-4">
                    <p className="uppercase tracking-widest text-xs sm:text-sm opacity-80">
                      {slide.title}
                    </p>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
                      {slide.subtitle}
                    </h1>

                    {slide.buttonText && slide.link && (
                      <button
                        onClick={() => handleCTA(slide)}
                        className="inline-flex items-center
                          px-6 py-3 rounded-full
                          bg-white text-black text-sm font-semibold
                          hover:bg-gray-200 transition"
                      >
                        {slide.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroCarousel;
