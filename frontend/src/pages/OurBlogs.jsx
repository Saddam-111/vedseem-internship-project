import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductDataContext } from '../context/ProductContext'; // Import your context

const OurBlogs = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { blogData } = useContext(ProductDataContext); // Get real blog data

  // Find the blog by id from fetched data
  const blog = blogData.find(b => b._id === id);

  if (!blog)
    return <p className="text-center text-red-500 mt-10">Blog not found!</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center gap-2"
      >
        ← Back
      </button>

      {/* Blog Content */}
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Left: Cover Image */}
        <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img
            src={blog.image.url}
            alt={blog.title}
            className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
          />
        </div>

        {/* Right: Text Content */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {blog.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-gray-500 mb-6">
            <span className="text-sm">Published: <span className="font-medium">{new Date(blog.createdAt).toLocaleDateString()}</span></span>
            <span className="text-sm">Author: <span className="font-medium">{blog.author || "Admin"}</span></span>
            <span className="text-sm">Category: <span className="font-medium">{blog.category || "Gifting"}</span></span>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-base md:text-lg leading-relaxed tracking-wide mb-6">
            {blog.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {blog.tags?.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tag === "Gifts"
                    ? "bg-blue-100 text-blue-700"
                    : tag === "Flowers"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurBlogs;
