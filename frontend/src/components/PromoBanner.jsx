import React from "react";
import { banner } from "../assets/assets";

const PromoBanner = () => {
  return (
   <div className="w-[94%] mx-auto flex flex-col md:flex-row gap-4 mt-4">
      {/* Banner 1 */}
      <div className="w-full md:w-1/2">
        <img
          src={banner.banner1}
          alt="Banner 1"
          className="w-full h-[130px] object-cover rounded-lg"
        />
      </div>

      {/* Banner 2 */}
      <div className="w-full md:w-1/2">
        <img
          src={banner.banner2}
          alt="Banner 2"
          className="w-full h-[130px] object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

export default PromoBanner;
