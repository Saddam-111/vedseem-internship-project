import React from "react";
import { heroImage } from "../assets/assets";

const Hero = () => {
  return (
    <div className="w-[99%] mx-auto md:px-20 pb-5">
      <img
        src={heroImage.hero}
        alt="Main Banner"
        className="w-full  py-2 rounded-lg object-contain"
      />
    </div>
  );
};

export default Hero;
