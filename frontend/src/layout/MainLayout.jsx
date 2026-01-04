import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer"
import MobileBottomNav from "../components/layout/MobileBottomNav";
import HelpWidget from "../components/layout/HelpWidget";


const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <MobileBottomNav/>
      <HelpWidget/>
      <Footer />
    </>
  );
};

export default MainLayout;
