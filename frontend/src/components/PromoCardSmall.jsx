import React from 'react'
import { heroImage } from '../assets/assets'
const PromoCardSmall = () => {
   return (
    <div className="w-full md:w-1/2 h-[400px] flex flex-col gap-2">
      {/* Pink Teddy Banner */}
      <div className="h-[200px] w-full bg-[#F491F4] rounded-2xl flex items-center justify-between px-6 py-4">
        {/* Left Text */}
        <div>
          <p className="text-white text-xl font-bold leading-snug">
            Capture the Magic <br /> Frame the Emotion
          </p>
          <button className="mt-3 px-4 py-1 bg-white text-sm font-semibold rounded-full shadow hover:bg-gray-100 transition">
            Explore More
          </button>
        </div>

        {/* Right Image */}
        <div className="h-full flex items-end">
          <img
            className="h-[160px] object-contain"
            src={heroImage.hero2}
            alt="Teddy Banner"
          />
        </div>
      </div>

      {/* Bottom Two Small Banners */}
      <div className="flex gap-4 h-[200px]">
        {/* Left Small Banner */}
        <div className="w-1/2 bg-[#E4A788] rounded-2xl flex flex-col items-center justify-center">
          <h3 className='text-white font-bold px-2'>Personalized Engraved Round Wooden Plank </h3>
          <img
            className="h-[120px] object-contain"
            src={heroImage.hero3}
            alt="Small Banner Left"
          />
        </div>

        {/* Right Small Banner */}
        <div className="w-1/2 bg-[#FFCC70] rounded-2xl flex flex-col items-center justify-center p-3 text-center">
          <h2 className="font-bold text-base mb-2 text-white">Electronics & Gadgets</h2>
          <img
            className="h-[100px] object-contain mb-2"
            src={heroImage.hero4}
            alt="Small Banner Right"
          />
          <button className="px-4 py-1 bg-white text-xs font-semibold rounded-full shadow hover:bg-gray-100 transition">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromoCardSmall