import React, { useContext, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext";
import Card from "../components/Card";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaFilter, FaTimes, FaSearch } from "react-icons/fa";

const Products = () => {
  const { category, subCategory } = useParams();
  const { items = [] } = useContext(ItemDataContext);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const [openDropdown, setOpenDropdown] = useState(null);

  // ---------------- Filtering ----------------
  let filtered = items.filter((p) => {
    if (category && subCategory) {
      return (
        p.category?.toLowerCase() === category.toLowerCase() &&
        p.subCategory?.toLowerCase() === subCategory.toLowerCase()
      );
    } else if (category) {
      return p.category?.toLowerCase() === category.toLowerCase();
    }
    return true;
  });

  filtered = filtered.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery)
  );

  filtered = filtered.filter((p) => {
    if (priceRange === "lt200") return p.price < 200;
    if (priceRange === "200to500") return p.price >= 200 && p.price <= 500;
    if (priceRange === "500to999") return p.price >= 500 && p.price <= 999;
    if (priceRange === "gt1000") return p.price > 1000;
    return true;
  });

  if (sortBy === "Name") {
    filtered.sort((a, b) =>
      sortOrder === "desc"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name)
    );
  } else if (sortBy === "Price") {
    filtered.sort((a, b) =>
      sortOrder === "desc" ? b.price - a.price : a.price - b.price
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput)}`);
    }
  };

  const formatName = (name) => {
    if (!name) return "All Products";
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const clearFilters = () => {
    setPriceRange("");
    setSortBy("");
    setSortOrder("");
    setSearchInput("");
    navigate("/products");
  };

  const Dropdown = ({ label, value, options, onChange, id }) => (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
        className="w-full sm:w-44 flex justify-between items-center border px-4 py-2.5 rounded-lg bg-white shadow-sm text-sm font-medium hover:border-yellow-400 hover:shadow-md transition-all duration-200"
      >
        <span className="truncate">
          {value ? options.find((o) => o.value === value)?.label : label}
        </span>
        <motion.span 
          animate={{ rotate: openDropdown === id ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2 text-gray-400"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {openDropdown === id && (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-xl overflow-hidden"
          >
            {options.map((opt, index) => (
              <motion.li
                key={opt.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  onChange(opt.value);
                  setOpenDropdown(null);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-yellow-50 hover:text-yellow-700 transition-colors ${
                  index !== 0 ? "border-t border-gray-100" : ""
                } ${value === opt.value ? "bg-yellow-50 text-yellow-600 font-medium" : "text-gray-700"}`}
              >
                {opt.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Header Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 px-4 md:px-6">
          {/* Left - Back & Title */}
          <div className="flex flex-row items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-full hover:bg-gray-100 shadow"
            >
              <FaArrowLeft size={18} />
            </button>

            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {formatName(subCategory || category) || "All Products"}
            </h2>
            
            <span className="text-sm text-gray-700 bg-white/50 px-2 py-1 rounded">
              ({filtered.length} products)
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Right - Filters (lg screens) */}
          <div className="hidden md:flex items-center gap-3">
            <Dropdown
              id="price"
              label="All Prices"
              value={priceRange}
              onChange={setPriceRange}
              options={[
                { value: "", label: "All Prices" },
                { value: "lt200", label: "Under ₹200" },
                { value: "200to500", label: "₹200 - ₹500" },
                { value: "500to999", label: "₹500 - ₹999" },
                { value: "gt1000", label: "Above ₹1000" },
              ]}
            />
            <Dropdown
              id="sortBy"
              label="Sort By"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "", label: "Sort By" },
                { value: "Name", label: "Name" },
                { value: "Price", label: "Price" },
              ]}
            />
            <Dropdown
              id="order"
              label="Order"
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: "", label: "Order" },
                { value: "asc", label: "Low to High" },
                { value: "desc", label: "High to Low" },
              ]}
            />
            {(priceRange || sortBy || sortOrder) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Toggle Button (sm + md) */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="md:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white rounded-lg shadow"
          >
            <FaFilter /> {showFilters ? "Hide" : "Filters"}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 py-2 bg-gray-50">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                <FaSearch />
              </button>
            </div>
          </form>
        </div>

        {/* Filters below (only on sm+md when toggled) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-50 border-t p-4 flex flex-col gap-4 md:hidden"
            >
              <Dropdown
                id="m-price"
                label="All Prices"
                value={priceRange}
                onChange={setPriceRange}
                options={[
                  { value: "", label: "All Prices" },
                  { value: "lt200", label: "Under ₹200" },
                  { value: "200to500", label: "₹200 - ₹500" },
                  { value: "500to999", label: "₹500 - ₹999" },
                  { value: "gt1000", label: "Above ₹1000" },
                ]}
              />
              <Dropdown
                id="m-sortBy"
                label="Sort By"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "", label: "Sort By" },
                  { value: "Name", label: "Name" },
                  { value: "Price", label: "Price" },
                ]}
              />
              <Dropdown
                id="m-order"
                label="Order"
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  { value: "", label: "Order" },
                  { value: "asc", label: "Low to High" },
                  { value: "desc", label: "High to Low" },
                ]}
              />
              {(priceRange || sortBy || sortOrder) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium text-center"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Grid */}
      <div className="pt-[140px] md:pt-[120px] p-4 md:p-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((item) => (
              <Card key={item._id} product={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your filters"}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
