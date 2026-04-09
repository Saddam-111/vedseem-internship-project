import React from "react";
import { testimonialData } from "../assets/assets";
import TestimonialCard from "./TestimonialCard";
import { motion } from "framer-motion";

const Testimonial = () => {
  return (
    <div className="w-full py-16 bg-gradient-to-b from-green-50 to-green-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real stories from real customers who found the perfect gift for their loved ones.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonialData.map((item, index) => (
            <TestimonialCard testimonial={item} key={index} index={index} />
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 md:p-12"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left side */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
                Subscribe to Our Newsletter
              </h1>
              <p className="text-black/70 text-lg">
                Get the latest gift ideas, exclusive offers, and personalized recommendations delivered to your inbox.
              </p>
            </div>

            {/* Right side - form */}
            <div className="lg:w-1/2 w-full">
              <form className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 text-gray-700"
                />
                <button className="bg-black text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition shadow-lg hover:shadow-xl whitespace-nowrap">
                  Subscribe
                </button>
              </form>
              <p className="text-black/60 text-sm mt-3 text-center lg:text-left">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonial;