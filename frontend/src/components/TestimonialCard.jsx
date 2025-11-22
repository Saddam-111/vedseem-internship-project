import React from "react";

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center w-full">
      {/* Image */}
      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-yellow-400">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text */}
      <p className="text-gray-700 italic mb-3">"{testimonial.text}"</p>

      {/* Name */}
      <p className="font-semibold text-gray-900">- {testimonial.name}</p>
    </div>
  );
};

export default TestimonialCard;
