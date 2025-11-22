import React from "react";
import { magic } from "../assets/assets";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-10 md:py-16 gap-10 mt-10">
        
        {/* Left Side - Text + Socials */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-yellow-400 leading-tight">
            THANK YOU <br /> FOR <br /> VISITING
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl">
            Your Love Your Story
          </p>

          {/* ✅ Social Media Section */}
          <div className="mt-4 space-y-2">
            <p className="text-gray-700 font-medium">Follow us on</p>
            <div className="flex items-center gap-4 text-2xl text-gray-600">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-600">
                <FaFacebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-500">
                <FaInstagram />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-black">
                <FaTwitter />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-red-600">
                <FaYoutube />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-700">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side - Images */}
        <div className="relative flex items-center justify-center w-full md:w-1/2">
          {/* Yellow Circle Background */}
          <div className="absolute w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] bg-yellow-300 rounded-full z-0"></div>

          {/* Main Big Teddy */}
          <img
            src={magic[0].image}
            alt={magic[0].label}
            className="w-36 sm:w-44 md:w-60 lg:w-72 relative z-10"
          />

          {/* Smaller Decorative Items */}
          <div className="absolute flex flex-wrap justify-center gap-3 sm:gap-4 bottom-2 sm:bottom-4 w-full px-2 sm:px-4 z-20">
            {magic.slice(1).map((item, index) => (
              <img
                key={index}
                src={item.image}
                alt={item.label}
                className="w-10 sm:w-14 md:w-16 lg:w-20 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
