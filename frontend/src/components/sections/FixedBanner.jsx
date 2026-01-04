import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getHeroSlides } from "../../api/hero.api";

const FixedBanner = () => {
  const [banner, setBanner] = useState(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let showTimer;
    let hideTimer;

    const loadBanner = async () => {
      try {
        const res = await getHeroSlides();

        // ✅ correct backend key
        const fixedBanners = res.data.fixedBanners || [];

        // take first active banner (order 10–14 already guaranteed by backend)
        const active = fixedBanners
          .filter((b) => b.isActive && b.image?.url)
          .sort((a, b) => a.order - b.order)[0];

        if (!active) return;

        setBanner(active);

        // show after 5s
        showTimer = setTimeout(() => {
          setVisible(true);

          // auto hide after 7s
          hideTimer = setTimeout(() => {
            setVisible(false);
          }, 55000);
        }, 5000);
      } catch (err) {
        console.error("Fixed banner error:", err);
      }
    };

    loadBanner();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  /* ================= CTA ================= */
  const handleCTA = () => {
    if (!banner?.link) return;

    if (banner.linkType === "EXTERNAL") {
      window.open(banner.link, "_blank", "noopener,noreferrer");
    } else if (banner.linkType === "ANCHOR") {
      const el = document.querySelector(banner.link);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(banner.link);
    }
  };

  if (!banner || !visible) return null;

  return (
  <div
    className="
      fixed left-1/2 -translate-x-1/2
      z-[999]
      w-[95%] max-w-4xl
      bottom-[72px] sm:bottom-6
    "
  >
    <div
      className="
        relative
        h-[96px] sm:h-[110px]
        rounded-2xl
        shadow-2xl cursor-pointer group
      "
      onClick={handleCTA}
    >
      {/* 🔥 INNER CLIPPED CONTAINER */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* IMAGE */}
        <img
          src={banner.image.url}
          alt={banner.title}
          className="
            absolute inset-0 w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-105
          "
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/55" />

        {/* CONTENT */}
        <div className="relative h-full flex items-center justify-between px-4 sm:px-6 text-white">
          <div className="space-y-1">
            {banner.title && (
              <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80">
                {banner.title}
              </p>
            )}

            {banner.subtitle && (
              <p className="text-sm sm:text-base font-semibold leading-tight">
                {banner.subtitle}
              </p>
            )}
          </div>

          {banner.buttonText && banner.link && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCTA();
              }}
              className="
                bg-white text-gray-900
                px-4 py-2 rounded-full
                text-xs sm:text-sm font-semibold
                hover:bg-gray-100 transition
              "
            >
              {banner.buttonText}
            </button>
          )}
        </div>
      </div>

      {/* ❌ CLOSE BUTTON — NOW VISIBLE */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        className="
          absolute -top-2 -right-2
          z-[9999]
          bg-white text-gray-800
          w-7 h-7 rounded-full
          flex items-center justify-center
          shadow-xl
          hover:bg-gray-100
        "
        aria-label="Close banner"
      >
        <X size={14} />
      </button>
    </div>
  </div>
);

};

export default FixedBanner;
