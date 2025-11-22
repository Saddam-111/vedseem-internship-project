import React, { useState, useContext } from "react";
import { images } from "../assets/assets";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { UserDataContext } from "../context/UserContext";
import { CartDataContext } from "../context/CartContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { userData, setUserData, baseUrl } = useContext(UserDataContext);
  const { cart } = useContext(CartDataContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (query) => {
    console.log("Searching for:", query);
  };

  const handleLogout = async () => {
    try {
      await axios.get(baseUrl + "/api/v1/auth/logout", {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/login");
    } catch (err) {
      console.log("Logout failed:", err);
    }
  };

  return (
    <nav className="w-full bg-white px-4 p-5 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={images.logo} alt="logo" className="h-16 w-auto" />
        </div>

        {/* SearchBar */}
        <SearchBar placeholder="Search products..." onSearch={handleSearch} />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 bg-[#F0D800] rounded-full p-2">
          <button
            onClick={() => navigate("/")}
            className="text-gray-800 font-semibold bg-white rounded-full transition py-1 px-6"
          >
            Home
          </button>

          {userData ? (
            <>
              <span className="font-medium text-gray-800 px-3">
                {userData.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="px-6 py-1 rounded-full bg-white font-medium text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-1 rounded-full bg-white font-medium"
            >
              Signup
            </button>
          )}

          {/* Cart */}
          <button
            onClick={() => navigate("/my-cart")}
            className="relative flex items-center gap-2 bg-white text-black font-medium lg:px-6 py-2 md:px-3 rounded-full transition"
          >
            <FaShoppingCart />
            <span className="hidden lg:inline">My Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>

          {/* Orders */}
          <button
            onClick={() => navigate("/orders")}
            className="relative flex items-center gap-2 bg-white text-black font-medium lg:px-6 py-2 md:px-3 rounded-full transition"
          >
            {/* Icon always visible */}
            <FaShoppingCart className="rotate-180" />
            {/* Text only visible on lg and above */}
            <span className="hidden lg:inline">My Orders</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-4">
          {!userData && (
            <button
              onClick={() => navigate("/signup")}
              className="px-3 py-1 rounded-full bg-[#F0D800] transition font-medium"
            >
              Signup
            </button>
          )}
          <button
            className="text-2xl text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown (absolute + animated) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-gray-50 shadow-md rounded-b-lg z-50 overflow-hidden"
          >
            <div className="flex flex-col items-center gap-4 py-4">
              <button
                onClick={() => {
                  navigate("/");
                  setMenuOpen(false);
                }}
                className="text-black font-semibold bg-[#F0D800] rounded-full px-6 py-2 transition"
              >
                Home
              </button>

              {/* Cart */}
              <button
                onClick={() => {
                  navigate("/my-cart");
                  setMenuOpen(false);
                }}
                className="relative flex items-center gap-2 bg-[#F0D800] font-medium text-black px-6 py-2 rounded-full transition"
              >
                <FaShoppingCart /> My Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Orders */}
              <button
                onClick={() => {
                  navigate("/orders");
                  setMenuOpen(false);
                }}
                className="bg-[#F0D800] font-medium text-black px-6 py-2 rounded-full transition"
              >
                My Orders
              </button>

              {/* Logout (moved here for mobile only) */}
              {userData && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="bg-red-500 text-white font-medium px-6 py-2 rounded-full transition"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;
