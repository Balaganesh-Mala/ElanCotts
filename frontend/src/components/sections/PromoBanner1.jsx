import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHeroSlides } from "../../api/hero.api";

const PromoBanner1 = () => {
  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const res = await getHeroSlides();

        // ONLY order 11
        const promo = (res.data.fixedBanners || []).find(
          (b) => b.isActive && b.order === 12 && b.image?.url
        );

        setBanner(promo || null);
      } catch (err) {
        console.error("Landing promo banner error:", err);
      }
    };

    loadBanner();
  }, []);

  if (!banner) return null;

  const handleClick = () => {
    if (!banner.link) return;

    if (banner.linkType === "EXTERNAL") {
      window.open(banner.link, "_blank");
    } else if (banner.linkType === "ANCHOR") {
      document
        .querySelector(banner.link)
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(banner.link);
    }
  };

  return (
    <section className="w-full mt-0">
      <div
        onClick={handleClick}
        className="
          w-full
          cursor-pointer
          overflow-hidden
          transition-shadow duration-300
          hover:shadow-xl
        "
      >
        <img
          src={banner.image.url}
          alt="Promotional Banner"
          loading="lazy"
          className="
    w-full
    h-auto
    sm:h-[350px]
    object-contain
    block
    px-3
  "
        />
      </div>
    </section>
  );
};

export default PromoBanner1;
