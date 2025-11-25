import React from "react";
import Hero from "../components/Hero";
import Features from "../context/Features";
import NewArrivals from "../components/NewArrivals";
import PopularProducts from "../components/PopularProducts";
import Testimonial from "../components/Testimonials";

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <NewArrivals/>
      <PopularProducts/>
      <div className="hidden sm:block max-padd-container mt-28 bg-[url('/src/assets/banner.png')] bg-cover bg-no-repeat h-72"></div>
      <Testimonial />
    </>
  );
};

export default Home;
