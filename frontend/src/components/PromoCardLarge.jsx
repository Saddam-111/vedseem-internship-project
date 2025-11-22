import React from "react";
import { heroImage } from "../assets/assets";

const PromoCardLarge = () => {
  return (
    <div className="w-full md:w-1/2 bg-[#0F84B3] relative h-[400px] rounded-2xl overflow-hidden">
      {/* Text */}
      <div className="p-6">
        <h1 className="text-white text-5xl font-bold leading-tight">
          Your Love <br /> Your Story <br /> Your Frame
        </h1>
        <p className="mt-3 text-white font-medium">
          Custom frame that preserve every heartbeat
        </p>
      </div>

      {/* Image */}
      <div className="absolute bottom-0 right-0 w-100 h-100">
        <img src={heroImage.hero1} alt="banner" className="object-contain w-full h-full" />
      </div>

      {/* Button */}
      <button className="absolute left-6 bottom-6 px-5 py-2 rounded-full bg-white text-[#0F84B3] font-semibold shadow hover:bg-gray-100 transition">
        Order Now
      </button>
    </div>
  );
};

export default PromoCardLarge;
