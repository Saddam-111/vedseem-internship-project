import React, { useState, useEffect, useRef, useContext } from "react";
import { IoMdSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = ({ placeholder = "Search..." }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { items = [] } = useContext(ItemDataContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = items
      .filter((p) =>
        p.name?.toLowerCase().includes(query.trim().toLowerCase())
      )
      .slice(0, 5);
    setSuggestions(filtered);
  }, [query, items]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 mx-4" ref={dropdownRef}>
      {/* Search Bar */}
      <div className="bg-[#F0D800] rounded-full p-2 flex items-center">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <IoMdSearch
            className="text-gray-500 text-xl cursor-pointer"
            onClick={handleSearch}
          />
        </div>
      </div>

      {/* Animated Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-xl mt-2 z-50 overflow-hidden"
          >
            {suggestions.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(`/product/${item._id}`);
                  setShowDropdown(false);
                }}
                className={`px-4 py-3 cursor-pointer hover:bg-yellow-50 flex items-center gap-3 transition-colors ${
                  index !== 0 ? "border-t border-gray-100" : ""
                }`}
              >
                <img
                  src={item.image?.url || "https://via.placeholder.com/40"}
                  alt={item.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">₹{item.price}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;