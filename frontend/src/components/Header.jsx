import React, { useState, useContext, useRef, useEffect } from "react";
import { images } from "../assets/assets";
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaSignOutAlt, FaBox, FaHeart } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import { UserDataContext } from "../context/UserContext";
import { CartDataContext } from "../context/CartContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { userData, setUserData, baseUrl } = useContext(UserDataContext);
  const { cart } = useContext(CartDataContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <img src={images.logo} alt="logo" className="h-14 md:h-16 w-auto" />
          </div>

          {/* SearchBar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <SearchBar placeholder="Search for gifts..." onSearch={handleSearch} />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Home */}
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-gray-700 font-medium hover:text-yellow-600 transition rounded-lg hover:bg-gray-50"
            >
              Home
            </button>

            {/* Products */}
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2 text-gray-700 font-medium hover:text-yellow-600 transition rounded-lg hover:bg-gray-50"
            >
              Products
            </button>

            {userData ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 rounded-full font-medium hover:bg-yellow-500 transition"
                >
                  <FaUser className="text-sm" />
                  <span className="max-w-[100px] truncate">{userData.firstName}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border overflow-hidden"
                    >
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 border-b bg-gray-50"
                      >
                        <p className="font-medium text-gray-800 truncate">{userData.firstName} {userData.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                      </motion.div>
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => { navigate("/orders"); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition"
                      >
                        <FaBox /> My Orders
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => { navigate("/my-cart"); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition"
                      >
                        <FaShoppingCart /> My Cart
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t"
                      >
                        <FaSignOutAlt /> Logout
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-gray-700 font-medium hover:text-yellow-600 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-yellow-400 rounded-full font-medium hover:bg-yellow-500 transition"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Cart */}
            <button
              onClick={() => navigate("/my-cart")}
              className="relative p-2 text-gray-700 hover:text-yellow-600 transition"
            >
              <FaShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile Cart */}
            <button
              onClick={() => navigate("/my-cart")}
              className="relative p-2 text-gray-700"
            >
              <FaShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              className="text-2xl text-gray-700 p-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <SearchBar placeholder="Search products..." onSearch={handleSearch} />
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-gray-50 border-t shadow-lg"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col p-4 gap-3"
            >
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => { navigate("/"); setMenuOpen(false); }}
                className="text-left px-4 py-3 text-gray-700 font-medium bg-white rounded-lg shadow-sm hover:bg-yellow-50 transition"
              >
                🏠 Home
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => { navigate("/products"); setMenuOpen(false); }}
                className="text-left px-4 py-3 text-gray-700 font-medium bg-white rounded-lg shadow-sm hover:bg-yellow-50 transition"
              >
                🎁 Products
              </motion.button>

              {userData ? (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => { navigate("/orders"); setMenuOpen(false); }}
                    className="text-left px-4 py-3 text-gray-700 font-medium bg-white rounded-lg shadow-sm hover:bg-yellow-50 transition"
                  >
                    📦 My Orders
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => { navigate("/my-cart"); setMenuOpen(false); }}
                    className="text-left px-4 py-3 text-gray-700 font-medium bg-white rounded-lg shadow-sm hover:bg-yellow-50 transition"
                  >
                    🛒 My Cart
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="text-left px-4 py-3 text-red-600 font-medium bg-white rounded-lg shadow-sm hover:bg-red-50 transition"
                  >
                    🚪 Logout
                  </motion.button>
                </>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => { navigate("/login"); setMenuOpen(false); }}
                    className="flex-1 px-4 py-3 text-gray-700 font-medium bg-white rounded-lg shadow-sm hover:bg-gray-50 transition"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => { navigate("/signup"); setMenuOpen(false); }}
                    className="flex-1 px-4 py-3 bg-yellow-400 font-medium rounded-lg shadow-sm hover:bg-yellow-500 transition"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;