import React from "react";
import { testimonialData } from "../assets/assets";
import TestimonialCard from "./TestimonialCard";
import { motion } from "framer-motion";

const ReviewSection = () => {
  return (
    <div className="w-full py-16 bg-gradient-to-br from-red-900 to-red-950">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Real Stories, Real Smiles
          </h2>
          <p className="text-red-200 text-lg max-w-2xl mx-auto">
            See what our happy customers have to say about their special gifts.
          </p>
        </motion.div>

        {/* Testimonials Scroll */}
        <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 px-2">
          {testimonialData.map((item, index) => (
            <div className="flex-shrink-0 w-80 md:w-96">
              <TestimonialCard testimonial={item} key={index} index={index} />
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-yellow-400 rounded-3xl p-8 md:p-12 mt-12"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left side */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
                Get Special Offers!
              </h1>
              <p className="text-black/70 text-lg">
                Subscribe to get exclusive deals and gift ideas delivered to your inbox.
              </p>
            </div>

            {/* Right side - form */}
            <div className="lg:w-1/2 w-full">
              <form className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl bg-white shadow-sm focus:outline-none text-gray-700"
                />
                <button className="bg-black text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition shadow-lg">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewSection;