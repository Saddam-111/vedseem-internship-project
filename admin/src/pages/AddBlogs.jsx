import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const AnimatedSelect = ({ value, onChange, options, placeholder, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <div
        onClick={() => setOpen(!open)}
        className={`border p-3 rounded-lg cursor-pointer flex justify-between items-center bg-white transition-all duration-200 hover:border-yellow-400 hover:shadow-md ${className}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {options.find((opt) => opt.value === value)?.label || placeholder || "Select"}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 text-xs"
        >
          ▼
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 overflow-hidden shadow-xl"
          >
            {options.map((opt, index) => (
              <motion.div
                key={opt.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-3 py-2.5 cursor-pointer transition-colors hover:bg-yellow-50 hover:text-yellow-700 ${
                  value === opt.value
                    ? "bg-yellow-50 text-yellow-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {opt.label}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AddBlogs = () => {
  const { baseUrl } = useContext(AuthDataContext);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("gifting");
  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const generateDescription = async () => {
    if (!title.trim()) {
      setErrorMsg("Please enter a blog title first");
      return;
    }
    if (!category) {
      setErrorMsg("Please select a category first");
      return;
    }
    
    setGeneratingDesc(true);
    setErrorMsg("");
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/v1/ai/generate-blog-description`,
        { title, category },
        { withCredentials: true }
      );
      if (data.success) {
        setDescription(data.description);
      } else {
        setErrorMsg(data.message || "Failed to generate description");
      }
    } catch (error) {
      console.error("Generate description error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to generate description");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category.toLowerCase());
      if (image) formData.append("image", image);

      const result = await axios.post(`${baseUrl}/api/v1/blogs/add`, formData, {
        withCredentials: true,
      });

      console.log("Blog added:", result.data);

      // Reset form
      setTitle("");
      setDescription("");
      setImage(null);
      setCategory("gifting");
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 overflow-auto mb-10 ">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#F0D800] to-[#897d0f] p-6">
          <h2 className="text-3xl font-bold text-white">Add New Blogs</h2>
          <p className="text-gray-200 mt-1">
            Fill all the details to add new blog
          </p>
        </div>

        <form onSubmit={handleAdd} className="p-6 space-y-6">
          <div>
            <p className="text-gray-700 font-semibold mb-2">Upload Image</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border border-gray-300 p-2 rounded-lg"
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
            <p className="text-gray-700 font-semibold mb-1">Title</p>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-gray-700 font-semibold">Description</p>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generatingDesc || !title || !category}
                className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingDesc ? "Generating..." : "✨ AI Generate"}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-red-500 mb-1">{errorMsg}</p>
            )}
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Enter product description"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-gray-700 font-semibold mb-1">Category</p>
              <AnimatedSelect
                value={category}
                onChange={setCategory}
                options={[
                  { value: "gifting", label: "Gifts" },
                  { value: "birthday", label: "Birthday" },
                  { value: "anniversary", label: "Anniversary" },
                  { value: "rakhi special", label: "Rakhi Special" },
                  { value: "congratulation", label: "Congratulation" },
                ]}
                placeholder="Select Category"
                className="w-full border border-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-[#F0D800] to-[#897d0f] text-white hover:from-yellow-400 hover:to-yellow-900"
            }`}
          >
            {loading ? "Adding Blog..." : "Add Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlogs;
