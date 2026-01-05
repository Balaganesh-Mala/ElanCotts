import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaComments } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { getHeroSlides } from "../../api/hero.api";


const DEFAULT_TEXT = import.meta.env.VITE_DEFAULT_TEXT || "";
const HELP_WIDGET_BANNER_ORDERS = [13, 14, 15];

const HelpWidget = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [carouselBanners, setCarouselBanners] = useState([]);

  // 🔥 SETTINGS FROM API
  const [supportPhone, setSupportPhone] = useState(
    import.meta.env.VITE_PHONE_NUMBER || ""
  );
  const [supportEmail, setSupportEmail] = useState(
    import.meta.env.VITE_SUPPORT_EMAIL || ""
  );

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
  const loadCarouselBanners = async () => {
    try {
      const res = await getHeroSlides();

      // SAME PATTERN AS PromoBanner
      const banners =
        res.data.fixedBanners
          ?.filter(
            (b) =>
              b.isActive &&
              HELP_WIDGET_BANNER_ORDERS.includes(Number(b.order)) &&
              b.image?.url
          )
          .sort((a, b) => a.order - b.order) || [];

      console.log("HELP WIDGET BANNERS:", banners);
      setCarouselBanners(banners);
    } catch (err) {
      console.error("Failed to load help widget banners", err);
    }
  };

  loadCarouselBanners();
}, []);


  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get("/settings/public");
        const settings = res.data.settings || {};

        if (settings.supportPhone) {
          setSupportPhone(settings.supportPhone);
        }

        if (settings.supportEmail) {
          setSupportEmail(settings.supportEmail);
        }
      } catch (err) {
        console.error("Failed to load support settings", err);
      }
    };

    loadSettings();
  }, []);

  /* ================= LINKS ================= */
  const whatsappUrl = supportPhone
    ? `https://wa.me/${supportPhone}?text=${DEFAULT_TEXT}`
    : "#";

  return (
    <>
      {/* ================= CHAT BUTTON ================= */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed z-[1000]
          right-5 bottom-[88px] sm:bottom-6
          w-14 h-14 rounded-full
          bg-indigo-600 hover:bg-indigo-700
          text-white shadow-xl
          flex items-center justify-center
        "
      >
        <FaComments size={22} />
      </button>

      {/* ================= OVERLAY ================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[999]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ================= PANEL ================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed bg-white z-[1001]
          shadow-2xl transition-all duration-300 ease-out
          ${
            isMobile
              ? `
                left-0 right-0 bottom-0
                rounded-t-2xl
                ${open ? "translate-y-0" : "translate-y-full"}
              `
              : `
                bottom-6 right-6
                w-[380px] h-[520px]
                rounded-2xl
                ${
                  open
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-20 pointer-events-none"
                }
              `
          }
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="relative">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={carouselBanners.length > 1}
            className="h-40 rounded-t-2xl overflow-hidden"
          >
            {carouselBanners.map((banner) => (
              <SwiperSlide key={banner._id}>
                <img
                  src={banner.image.url}
                  alt="Support Banner"
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            onClick={() => setOpen(false)}
            className="
              absolute top-3 right-3
              w-8 h-8 rounded-full
              bg-white shadow
              flex items-center justify-center z-[999]
            "
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-5 space-y-4 overflow-y-auto h-[calc(100%-10rem)]">
          <div>
            <h3 className="text-lg font-semibold">How can we help?</h3>
            <p className="text-sm text-slate-500">Choose one option below</p>
          </div>

          {/* WHATSAPP */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 p-4 border rounded-xl hover:bg-indigo-50"
          >
            <FaWhatsapp size={24} className="text-indigo-600" />
            <div>
              <p className="font-semibold">Chat with us</p>
              <p className="text-sm text-slate-500">Instant WhatsApp support</p>
            </div>
          </a>

          {/* CALL */}
          {supportPhone && (
            <a
              href={`tel:${supportPhone}`}
              className="flex gap-4 p-4 border rounded-xl hover:bg-indigo-50"
            >
              <FaPhoneAlt size={22} className="text-indigo-600" />
              <div>
                <p className="font-semibold">Talk to us</p>
                <p className="text-sm text-slate-500">Call customer care</p>
              </div>
            </a>
          )}

          {/* EMAIL */}
          {supportEmail && (
            <a
              href={`mailto:${supportEmail}`}
              className="flex gap-4 p-4 border rounded-xl hover:bg-indigo-50"
            >
              <FaEnvelope size={22} className="text-indigo-600" />
              <div>
                <p className="font-semibold">Write to us</p>
                <p className="text-sm text-slate-500">Email support</p>
              </div>
            </a>
          )}

          {isMobile && <div className="h-6" />}
        </div>
      </div>
    </>
  );
};

export default HelpWidget;
