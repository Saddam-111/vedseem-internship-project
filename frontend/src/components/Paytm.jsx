import React from "react";
import { FaYoutube, FaInstagram, FaXTwitter, FaLinkedin, FaFacebook } from "react-icons/fa6";
import { SiPaytm } from "react-icons/si";

const Paytm = () => {
  return (
    <div className="hidden lg:flex w-[94%] mx-auto flex-row items-center justify-between bg-gray-100 px-6 py-2 rounded-md mt-4">
      
      {/* ✅ Left Side - Logos + Text */}
      <div className="flex flex-col items-start text-left">
        <div className="flex items-center text-5xl text-blue-600">
          <SiPaytm className="hover:scale-110 transition-transform" size={60} />
        </div>
        <p className="text-gray-700 text-sm md:text-base">
          Cashback & Paytm Assured Vouchers <span className="font-semibold">T&C Apply</span>
        </p>
      </div>

      {/* ✅ Right Side - Social Media */}
      <div className="flex flex-col items-end text-right space-y-2">
        <p className="text-gray-700 font-medium">Follow us on</p>
        <div className="flex items-center gap-4 text-xl">
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-red-600">
            <FaYoutube />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-pink-500">
            <FaInstagram />
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-black">
            <FaXTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-blue-700">
            <FaLinkedin />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-blue-600">
            <FaFacebook />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Paytm;
