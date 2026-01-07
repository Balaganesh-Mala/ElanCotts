import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { getVideos } from "../../api/index.api";

import "swiper/css";

const InstagramVideosSkeleton = () => {
  return (
    <section className="pt-5 pb-10 bg-[#f6faf6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 animate-pulse">
        {/* TITLE SKELETON */}
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-80 bg-slate-200 rounded mx-auto mt-3" />
        </div>

        {/* VIDEO CARDS SKELETON */}
        <div className="flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[260px] h-[420px] bg-slate-200 rounded-2xl flex-shrink-0"
            />
          ))}
        </div>

        {/* CTA SKELETON */}
        <div className="mt-12 flex justify-center">
          <div className="h-12 w-56 bg-slate-200 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default function InstagramVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD VIDEOS ================= */
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await getVideos();
        setVideos(res.data.videos || []);
      } catch (err) {
        console.error("Failed to load videos", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <InstagramVideosSkeleton />;
  }

  if (!videos.length) return null;

  return (
    <section className="pt-5 pb-10 bg-[#f6faf6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* TITLE */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900">
            From Our Instagram
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Real moments • Real products • Real stories
          </p>
        </div>

        {/* VIDEO LOOP */}
        <Swiper
          modules={[Autoplay]}
          loop
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={8000}
          slidesPerView="auto"
          spaceBetween={24}
        >
          {[...videos, ...videos].map((item, index) => (
            <SwiperSlide key={item._id + index} className="!w-[260px]">
              <div className="rounded-2xl overflow-hidden shadow-md bg-black">
                <video
                  src={item.video?.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-[420px] object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3
                       rounded-full bg-[#1b477c] text-white
                       hover:bg-[#122e51] transition"
          >
            View More on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
