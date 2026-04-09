import React from "react";
import { magic } from "../assets/assets";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaPhone, FaEnvelope, FaMapMarker } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">About Us</h3>
            <p className="text-sm text-gray-400 mb-4">
              We specialize in personalized gifts that make every moment special. Quality products with fast delivery.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <FaPhone className="text-yellow-400" /> +91 98765 43210
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-yellow-400" /> info@dhanushdigital.com
              </p>
              <p className="flex items-center gap-2">
                <FaMapMarker className="text-yellow-400" /> Mumbai, India
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/")} className="hover:text-yellow-400 transition">Home</button></li>
              <li><button onClick={() => navigate("/products")} className="hover:text-yellow-400 transition">All Products</button></li>
              <li><button onClick={() => navigate("/my-cart")} className="hover:text-yellow-400 transition">Cart</button></li>
              <li><button onClick={() => navigate("/orders")} className="hover:text-yellow-400 transition">My Orders</button></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate("/products/category/gifts")} className="hover:text-yellow-400 transition">Gifts</button></li>
              <li><button onClick={() => navigate("/products/category/toys")} className="hover:text-yellow-400 transition">Toys</button></li>
              <li><button onClick={() => navigate("/products/category/flowers")} className="hover:text-yellow-400 transition">Flowers</button></li>
              <li><button onClick={() => navigate("/products/category/personalized-gifts")} className="hover:text-yellow-400 transition">Personalized</button></li>
              <li><button onClick={() => navigate("/products/category/home-decor")} className="hover:text-yellow-400 transition">Home Decor</button></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><button className="hover:text-yellow-400 transition">Shipping Policy</button></li>
              <li><button className="hover:text-yellow-400 transition">Return & Refund</button></li>
              <li><button className="hover:text-yellow-400 transition">Privacy Policy</button></li>
              <li><button className="hover:text-yellow-400 transition">Terms & Conditions</button></li>
              <li><button className="hover:text-yellow-400 transition">Contact Us</button></li>
            </ul>
          </div>
        </div>

        {/* Social Media & Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">Follow us:</p>
              <div className="flex items-center gap-3">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition">
                  <FaFacebook />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition">
                  <FaInstagram />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition">
                  <FaTwitter />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition">
                  <FaYoutube />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-500">
              © 2025 Dhanush Digital. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Section */}
      <div className="bg-yellow-400 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-black">THANK YOU</h2>
            <p className="text-black/70">Your Love, Your Story</p>
          </div>
          <div className="flex items-center gap-4">
            <img src={magic[0].image} alt="Gift" className="h-16 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
