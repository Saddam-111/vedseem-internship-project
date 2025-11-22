import React, { useState, useEffect, useRef, useContext } from "react";
import { IoMdSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext"; // ✅ correct context

const SearchBar = ({ placeholder = "Search..." }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { items = [] } = useContext(ItemDataContext); // ✅ use items
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

  // ✅ Filter frontend items instead of products
  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const filtered = items
      .filter((p) =>
        p.name?.toLowerCase().includes(query.trim().toLowerCase())
      )
      .slice(0, 5); // only top 5
    setSuggestions(filtered);
  }, [query, items]);

  // ✅ Close dropdown if clicked outside
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

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-2 z-50">
          {suggestions.map((item, index) => (
            <div
              key={item._id || index}
              onClick={() => {
                navigate(`/product/${item._id}`);
                setShowDropdown(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                index !== 0 ? "border-t border-gray-200" : ""
              }`}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
