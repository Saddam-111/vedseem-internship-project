import React, { useContext, useState } from "react";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";


const AddBlogs = () => {
  const {baseUrl} = useContext(AuthDataContext)
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("gifting"); // lowercase
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category.toLowerCase()); // send lowercase
      if (image) formData.append("image", image);

      const result = await axios.post(
        `${baseUrl}/api/v1/blogs/add`,
        formData,
        { withCredentials: true }
      );

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
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F0D800] to-[#897d0f] p-6">
          <h2 className="text-3xl font-bold text-white">Add New Blogs</h2>
          <p className="text-gray-200 mt-1">Fill all the details to add new blog</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdd} className="p-6 space-y-6">
          {/* Image Upload */}
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

          {/* Product Name */}
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

          {/* Description */}
          <div>
            <p className="text-gray-700 font-semibold mb-1">Description</p>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Category & Subcategory */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-gray-700 font-semibold mb-1">Category</p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
              >
                <option value="gifting">Gifts</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="rakhi special">Rakhi Special</option>
                <option value="congratulation">Congratulation</option>
              </select>
            </div>

          </div>


          {/* Submit */}
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
