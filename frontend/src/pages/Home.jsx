import React from "react";
import NavSection from "../components/NavSection";
import HeroGridSection from "../components/HeroGridSection";
import Gift from "../components/Gift";
import ReviewSection from "../components/ReviewSection";
import BlogSection from "../components/BlogSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <main className="w-full flex flex-col overflow-hidden ">
      <NavSection />
      <HeroGridSection />
      <Gift />
      <ReviewSection />
      <BlogSection />
      <Footer />
    </main>
  );
};

export default Home;
