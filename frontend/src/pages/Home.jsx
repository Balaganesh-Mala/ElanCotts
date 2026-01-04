import React from "react";
import HeroCarousel from "../components/carousel/HeroCarousel";
import NewArrivals from "../components/sections/NewArrivals";
import FeaturedCarousel from "../components/carousel/FeaturedCarousel";
import CategorySection from "../components/sections/CategorySection";
import BestSeller from "../components/sections/BestSeller";
import RecentlyViewed from "../components/sections/RecentlyViewed";
import FixedBanner from "../components/sections/FixedBanner";
import InstagramVideos from "../components/sections/InstagramVideos";
import CustomerReviews from "../components/sections/CustomerReviews";
import LandingPromoBanner from "../components/sections/LandingPromoBanner";
import PromoBanner1 from "../components/sections/PromoBanner1";


const Home = () => {
  return (
    <div>
      <HeroCarousel />
      <CategorySection/>
      <NewArrivals/>
      <LandingPromoBanner/>
      <BestSeller/>
      <FixedBanner/>
      <PromoBanner1/>
      <FeaturedCarousel/>
      <RecentlyViewed/>
      <InstagramVideos/>
      <CustomerReviews/>
    </div>
  );
};

export default Home;
