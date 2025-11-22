import React from "react";
import { testimonialData } from "../assets/assets";
import TestimonialCard from "./TestimonialCard";

const Testimonial = () => {
  return (
    <div className="w-full py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col gap-8 rounded-3xl bg-green-200 py-10">
        {/* Heading Section */}
        <div className="flex flex-col justify-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Real stories. Real smiles.
          </h2>
          <p className="mt-2 text-gray-700 text-base md:text-lg">
            See what our happy customers have to say about their special gifts.
          </p>
        </div>

        {/* Testimonials Section */}
        <div className="flex flex-col lg:flex-row gap-6 pb-4 items-center lg:items-stretch">
          {testimonialData.map((item, index) => (
            <TestimonialCard testimonial={item} key={index} />
          ))}
        </div>
      </div>

      {/* //newsletter  */}

      <div className="bg-[#F6F5E3] w-full mt-10 p-10 rounded-md">
        <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-6">
          {/* Left side - heading and paragraph */}
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-4xl font-bold text-[#E1CD19]">
              Newsletter updates !!
            </h1>
            <p className="mt-2 text-gray-700">
              Get new & trendy gift ideas and best offers delivered directly to
              your inbox
            </p>
          </div>

          {/* Right side - form */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <form className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <input
                type="text"
                placeholder="Enter your email"
                className="p-2 bg-white rounded flex-1 hover:ring-yellow-400 outline-none focus:outline-none focus:ring-2 "
              />
              <button className="bg-yellow-400 text-black font-bold px-6 py-3 rounded hover:bg-blue-600 text-xl">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
