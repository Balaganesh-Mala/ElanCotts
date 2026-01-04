import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { FaStar } from "react-icons/fa";

import "swiper/css";

/* ===== DUMMY REVIEWS ===== */
const reviews = [
  {
    id: 1,
    name: "Priya N.",
    rating: 5,
    comment:
      "The saree fabric feels incredibly premium and soft.\n" +
      "You can see the rich craftsmanship in every drape.\n" +
      "Perfect for weddings and festive occasions.\n" +
      "ElanCotts is now my go-to for ethnic wear."
  },
  {
    id: 2,
    name: "Karthik R.",
    rating: 4,
    comment:
      "Consistent fit in every shirt I've ordered.\n" +
      "The fabric stays crisp even after multiple washes.\n" +
      "Packaging is neat and the delivery was prompt.\n" +
      "Very satisfied with the office wear collection."
  },
  {
    id: 3,
    name: "Ritika J.",
    rating: 5,
    comment:
      "Beautiful designer sarees delivered right on time.\n" +
      "The colors are exactly as shown on the website.\n" +
      "Great variety for both casual and heavy wear.\n" +
      "Feels elegant, stylish, and very comfortable."
  },
  {
    id: 4,
    name: "Shalini G.",
    rating: 5,
    comment:
      "Quality matches exactly what ElanCotts promises.\n" +
      "The T-shirts feel rich, breathable, and durable.\n" +
      "Perfect fit that gives a very premium look.\n" +
      "A very trustworthy brand for high-quality cottons."
  },
  {
    id: 5,
    name: "Aarti D.",
    rating: 4,
    comment:
      "The sarees have a smooth and luxurious texture.\n" +
      "No color fading or shrinkage noticed after wash.\n" +
      "The premium packaging keeps the clothes safe.\n" +
      "Good value for such high-end designer pieces."
  },
  {
    id: 6,
    name: "Anil K.",
    rating: 5,
    comment:
      "Truly premium quality shirts and T-shirts.\n" +
      "The stitching and finish are world-class.\n" +
      "Customer service is helpful and delivery is fast.\n" +
      "Highly recommended for modern men's fashion."
  },
  {
    id: 7,
    name: "Suresh M.",
    rating: 5,
    comment:
      "Best formal shirts I have ever purchased online.\n" +
      "The cotton material is breathable and high quality.\n" +
      "Fits perfectly across the shoulders and chest.\n" +
      "Great value for money for professional attire."
  },
  {
    id: 8,
    name: "Megha S.",
    rating: 5,
    comment:
      "The mirror work on my onion pink saree is stunning.\n" +
      "It looks even better in person than in the photos.\n" +
      "Received so many compliments at the party.\n" +
      "ElanCotts understands modern ethnic trends perfectly."
  },
  {
    id: 9,
    name: "Vikram P.",
    rating: 4,
    comment:
      "Impressive range of casual T-shirts for daily use.\n" +
      "The colors remain vibrant even after several washes.\n" +
      "Very soft on the skin and perfect for summer.\n" +
      "Fast shipping and very reliable brand."
  },
  {
    id: 10,
    name: "Ananya V.",
    rating: 5,
    comment:
      "The Gold Tissue saree is absolutely royal.\n" +
      "The zari work is intricate and doesn't feel heavy.\n" +
      "It drapes like a dream and stays in place.\n" +
      "Perfect for brides and bridesmaids alike."
  }
];


const ReviewCard = ({ review }) => (
  <div className="bg-white border rounded-xl px-5 py-4 shadow-sm w-[380px]">
    <div className="flex items-center gap-1 text-yellow-500 mb-2">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          size={14}
          className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
        />
      ))}
    </div>

    <p className="text-sm text-gray-700 leading-relaxed mb-2">
      {review.comment}
    </p>

    <p className="text-sm font-medium text-gray-900">
      {review.name}
    </p>
  </div>
);

export default function CustomerReviews() {
  return (
    <section className="py-8 bg-[#faf8f6] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* TITLE */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-gray-900">
            Our customers love us
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ⭐ 4.8 star based on 611 customer reviews
          </p>
        </div>

        {/* ===== ROW 1 ===== */}
        <Swiper
          modules={[Autoplay]}
          loop
          speed={12000}              // 👈 ultra smooth
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          slidesPerView="auto"
          spaceBetween={24}
          className="mb-8"
        >
          {[...reviews, ...reviews].map((review, i) => (
            <SwiperSlide key={`row1-${i}`} className="!w-auto">
              <ReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ===== ROW 2 (REVERSE DIRECTION) ===== */}
        <Swiper
          modules={[Autoplay]}
          loop
          speed={12000}
          autoplay={{
            delay: 0,
            reverseDirection: true,   // 👈 opposite direction
            disableOnInteraction: false,
          }}
          slidesPerView="auto"
          spaceBetween={24}
        >
          {[...reviews, ...reviews].map((review, i) => (
            <SwiperSlide key={`row2-${i}`} className="!w-auto">
              <ReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}
