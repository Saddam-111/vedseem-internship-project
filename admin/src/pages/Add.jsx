// src/pages/admin/Add.jsx
import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const categoryOptions = [
  { value: "gifts", label: "Gifts" },
  { value: "toys", label: "Toys" },
  { value: "flowers", label: "Flowers" },
  { value: "tablelamp", label: "Table Lamp" },
  { value: "watch", label: "Watch" },
  { value: "icecream", label: "Ice Cream" },
  { value: "personalized-gifts", label: "Personalized Gifts" },
  { value: "gifts-for-men", label: "Gifts for Men" },
  { value: "gifts-for-women", label: "Gifts for Women" },
  { value: "electronics-gadgets", label: "Electronics & Gadgets" },
  { value: "fashion-accessories", label: "Fashion & Accessories" },
  { value: "home-decor", label: "Home & Decor" },
  { value: "food-beverages", label: "Food & Beverages" },
  { value: "toys-games", label: "Toys & Games" },
  { value: "wellness-selfcare", label: "Wellness & Self-Care" },
  { value: "rakhi-specials", label: "Rakhi Specials" },
  { value: "gifts-for-kids", label: "Gifts for Kids" },
  { value: "all-gifts", label: "All Gifts" },
  { value: "same-day-delivery", label: "Same Day Delivery" },
  { value: "trending-drinkware", label: "Trending Drinkware" },
];
const subCategoryOptions = [
  { value: "general", label: "General" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "congratulation", label: "Congratulation" },
  { value: "thanks", label: "Thanks" },
  { value: "personalized-gifts", label: "Personalized Gifts" },
  { value: "electronics-gadgets", label: "Electronics & Gadgets" },
  { value: "fashion-accessories", label: "Fashion & Accessories" },
  { value: "home-decor", label: "Home & Decor" },
  { value: "food-beverages", label: "Food & Beverages" },
  { value: "toys-games", label: "Toys & Games" },
  { value: "wellness-selfcare", label: "Wellness & Self-Care" },
];

/* Dropdown component unchanged (copy from yours) */
const Dropdown = ({ options, value, setValue, label, disabled }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <label className="text-gray-700 font-semibold mb-1 block">{label}</label>
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`border p-3 rounded-lg cursor-pointer flex justify-between items-center bg-white transition-colors ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "border-gray-300 hover:border-blue-300"
        }`}
      >
        <span>
          {options.find((opt) => opt.value === value)?.label ||
            `Select ${label}`}
        </span>
        <span
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        >
          ▼
        </span>
      </div>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 overflow-y-auto max-h-44 shadow-lg"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  setValue(opt.value);
                  setOpen(false);
                }}
                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Add = () => {
  const { baseUrl } = useContext(AuthDataContext);
  if (!baseUrl)
    return (
      <div className="text-center p-6 text-red-600">
        Please log in to add products.
      </div>
    );

  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim()) return setErrorMsg("Product name is required.");
    if (!description.trim() || description.length < 10)
      return setErrorMsg("Description (min 10 chars) is required.");
    if (price <= 0) return setErrorMsg("Price must be greater than 0.");
    if (stock < 0) return setErrorMsg("Stock cannot be negative.");
    if (!category) return setErrorMsg("Please select a category.");
    if (!subCategory) return setErrorMsg("Please select a subcategory.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("subCategory", subCategory);
      // IMPORTANT: send isCustomizable as string so backend parseBoolean handles it
      formData.append("isCustomizable", isCustomizable ? "true" : "false");
      if (image) formData.append("image", image);

      const result = await axios.post(
        `${baseUrl}/api/v1/product/addProduct`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Product added successfully!");
      // reset
      setName("");
      setDescription("");
      setImage(null);
      setPrice(0);
      setStock(0);
      setIsCustomizable(false);
      setCategory("");
      setSubCategory("");
    } catch (error) {
      console.error("Add product error:", error);
      setErrorMsg(
        error.response?.data?.message || "Failed to add product. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 overflow-auto mb-3">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#F0D800] to-[#897d0f] p-6">
          <h2 className="text-3xl font-bold text-white">Add New Product</h2>
          <p className="text-gray-200 mt-1">
            Fill all the details to add a product
          </p>
        </div>

        <form onSubmit={handleAdd} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <p className="text-gray-700 font-semibold mb-2">Upload Image</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              disabled={loading}
              className="w-full border border-gray-300 p-2 rounded-lg disabled:opacity-50"
            />
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="mt-3 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          <div>
            <p className="text-gray-700 font-semibold mb-1">Product Name</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <p className="text-gray-700 font-semibold mb-1">Stock</p>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <p className="text-gray-700 font-semibold mb-1">
              Product Description
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              required
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <Dropdown
            options={categoryOptions}
            value={category}
            setValue={setCategory}
            label="Category"
            disabled={loading}
          />
          <Dropdown
            options={subCategoryOptions}
            value={subCategory}
            setValue={setSubCategory}
            label="Subcategory"
            disabled={loading}
          />

          <div>
            <p className="text-gray-700 font-semibold mb-1">Product Price</p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="customization"
              checked={isCustomizable}
              onChange={(e) => setIsCustomizable(e.target.checked)}
              disabled={loading}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label
              htmlFor="customization"
              className="text-gray-700 font-medium cursor-pointer select-none"
            >
              Customization Available
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-[#F0D800] to-[#897d0f] text-white"
            }`}
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
