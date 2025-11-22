// BlogCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const BlogCard = ({ blog }) => {
  const shortDescription =
    blog.description.split(" ").slice(0, 5).join(" ") + "...";

  return (
    <Link
      to={`/read-blogs/${blog._id}`}
      className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg overflow-hidden w-full h-auto sm:h-48"
    >
      {/* Left: Image */}
      <div className="w-full sm:w-1/2 h-30 sm:h-full">
        <img
          src={blog.image.url}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right */}
      <div className="w-full sm:w-1/2 p-4 flex flex-col justify-between">
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2">
          {blog.title}
        </h2>
        <p className="text-gray-600 text-sm md:text-base">{shortDescription}</p>
        <button className="mt-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm md:text-base">
          Keep reading
        </button>
      </div>
    </Link>
  );
};

export default BlogCard;
