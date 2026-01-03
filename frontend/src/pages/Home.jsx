import React from "react";
import HeroCarousel from "../components/carousel/HeroCarousel";
import NewArrivals from "../components/sections/NewArrivals";
import FeaturedCarousel from "../components/carousel/FeaturedCarousel";
import CategorySection from "../components/sections/CategorySection";
import BestSeller from "../components/sections/BestSeller";
import RecentlyViewed from "../components/sections/RecentlyViewed";
import FixedBanner from "../components/sections/FixedBanner";


const Home = () => {
  return (
    <div>
      <HeroCarousel />
      <CategorySection/>
      <NewArrivals/>
      <BestSeller/>
      <FixedBanner/>
      <FeaturedCarousel/>
      <RecentlyViewed/>
    </div>
  );
};

export default Home;
