import React from "react";
import Header from "./Header";
import QuickIconsBar from "./QuickIconsBar";
import CategoryBar from "./CategoryBar";
import GiftSection from "./GiftSection";
import Hero from "./Hero";

const NavSection = () => {
  return (
    <section className="w-full flex flex-col">
      {/* Navbar */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* Quick Icons Bar */}
      <div className="mt-1 w-full flex justify-center flex-shrink-0">
        <div className="w-[90%] max-w-6xl">
          <QuickIconsBar />
        </div>
      </div>

      {/* Category Bar */}
      {/* <div className="mt-2 w-full flex-shrink-0">
        <CategoryBar />
      </div> */}

      {/* Gift Section */}
      <div className="mt-1 w-full flex-shrink-0">
        <GiftSection />
      </div>

      {/* Hero Section fills remaining space */}
      <div className="flex-1 w-full ">
        <Hero />
      </div>
    </section>
  );
};

export default NavSection;
