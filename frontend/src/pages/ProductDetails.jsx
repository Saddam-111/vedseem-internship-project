import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext";
import { CartDataContext } from "../context/CartContext";
import { UserDataContext } from "../context/UserContext";
import RelatedProduct from "../components/RelatedProduct";
import Header from "../components/Header";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { items = [] } = useContext(ItemDataContext);
  const { addToCart } = useContext(CartDataContext);
  const { baseUrl } = useContext(UserDataContext);

  const product = items.find((p) => p._id === id);

  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState("");
  const [customImage, setCustomImage] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  // ⭐ Fetch Reviews
  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      const res = await axios.get(`${baseUrl}/api/v1/review/${product._id}`);
      setReviews(res.data.reviews || []);
    };

    fetchReviews();
  }, [product, baseUrl]);

  if (!product) {
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading product...
      </div>
    );
  }

  // ⭐ Add to Cart
  const handleAddToCart = async () => {
    const formData = new FormData();
    formData.append("productId", product._id);
    formData.append("quantity", quantity);

    // 🔥 FIXED — using product.isCustomizable everywhere
    if (product.isCustomizable) {
      formData.append("customText", customText);
      if (customImage) formData.append("customImage", customImage);
    }

    await addToCart(formData);
    navigate("/my-cart");
  };

  return (
    <>
      <Header />

      <div className="bg-gray-50 min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT — PRODUCT IMAGE */}
          <div className="flex justify-center items-start">
            <div className="bg-white rounded-xl shadow-lg p-4 w-full">
              <img
                src={product.image?.url}
                alt={product.name}
                className="rounded-lg w-full max-h-[550px] object-contain"
              />
            </div>
          </div>

          {/* RIGHT — DETAILS */}
          <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 h-fit space-y-6">

            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-pink-600">₹{product.price}</p>

            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            <p className="text-sm text-gray-700">
              Stock:
              <span className={`ml-1 font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {product.stock}
              </span>
            </p>

            {/* ⭐ FIXED CUSTOMIZATION SECTION */}
            {product.isCustomizable && (
              <div className="mt-3 p-5 rounded-xl border border-pink-200 bg-pink-50 shadow-sm">
                <h3 className="text-lg font-bold text-pink-700 mb-3">
                  ✨ Personalize Your Gift ✨
                </h3>

                <div className="space-y-5">

                  {/* Custom Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Custom Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter name or message"
                      className="w-full border border-pink-300 rounded-lg p-3 focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>

                  {/* Custom Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload Custom Image
                    </label>
                    <label className="cursor-pointer bg-white border border-pink-300 px-4 py-2 rounded-lg shadow-sm hover:bg-pink-100 text-pink-700 transition">
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCustomImage(e.target.files[0])}
                        className="hidden"
                      />
                    </label>

                    {customImage && (
                      <img
                        src={URL.createObjectURL(customImage)}
                        alt="Preview"
                        className="mt-3 w-20 h-20 object-cover rounded-lg shadow-md border"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="w-10 h-10 bg-gray-200 rounded-lg text-xl font-bold"
              >
                -
              </button>

              <span className="text-xl font-bold">{quantity}</span>

              <button
                onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                className="w-10 h-10 bg-pink-600 text-white rounded-lg text-xl font-bold"
              >
                +
              </button>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-pink-600 text-white text-lg rounded-xl hover:bg-pink-700"
            >
              Add to Cart
            </button>

          </div>
        </div>

        {/* ⭐ REVIEWS SECTION */}
        <div className="mt-14 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

          <div className="flex items-center gap-4 mb-6">
            <p className="text-3xl font-bold text-pink-600">
              {product.rating?.toFixed(1) || 0}
            </p>
            <p className="text-gray-700">{product.numReviews || 0} Reviews</p>
          </div>

          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <p className="font-semibold">{r.name}</p>
                <p className="text-yellow-500">{"⭐".repeat(r.rating)}</p>
                <p className="text-gray-600 mt-1">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Write Review */}
          <div className="mt-8">
            <h3 className="font-bold mb-3">Write a Review</h3>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border rounded-lg p-2 mb-3"
            >
              <option value="">Select Rating</option>
              <option value="1">⭐</option>
              <option value="2">⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="5">⭐⭐⭐⭐⭐</option>
            </select>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Write your review"
            />

            <button
              onClick={async () => {
                await axios.post(
                  `${baseUrl}/api/v1/review/${product._id}`,
                  { rating, comment },
                  { withCredentials: true }
                );
                window.location.reload();
              }}
              className="mt-3 px-6 py-2 bg-pink-600 text-white rounded-lg"
            >
              Submit Review
            </button>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProduct currentProduct={product} />
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
