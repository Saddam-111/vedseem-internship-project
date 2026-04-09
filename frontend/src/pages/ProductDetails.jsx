import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext";
import { CartDataContext } from "../context/CartContext";
import { UserDataContext } from "../context/UserContext";
import RelatedProduct from "../components/RelatedProduct";
import Header from "../components/Header";
import { FaStar, FaShoppingCart, FaArrowLeft, FaCheck, FaShippingFast, FaMagic } from "react-icons/fa";

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
  const [addedToCart, setAddedToCart] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/v1/review/${product._id}`);
        setReviews(res.data.reviews || []);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchReviews();
  }, [product, baseUrl]);

  if (!product) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-600">Loading product...</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const formData = new FormData();
    formData.append("productId", product._id);
    formData.append("quantity", quantity);

    if (product.isCustomizable) {
      formData.append("customText", customText);
      if (customImage) formData.append("customImage", customImage);
    }

    await addToCart(formData);
    setAddedToCart(true);
    setTimeout(() => {
      navigate("/my-cart");
    }, 1000);
  };

  const generateSummary = async () => {
    if (!product?.description) return;
    setGeneratingSummary(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/api/v1/ai/summarize-description`,
        { description: product.description },
        { withCredentials: true }
      );
      if (data.success) {
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error("Generate summary error:", error);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating || !comment) return;
    setIsSubmitting(true);
    try {
      await axios.post(
        `${baseUrl}/api/v1/review/${product._id}`,
        { rating, comment },
        { withCredentials: true }
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Breadcrumb */}
        <div className="bg-white shadow-sm py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-yellow-600">
              <FaArrowLeft />
            </button>
            <span className="text-gray-400">|</span>
            <button onClick={() => navigate("/")} className="text-gray-500 hover:text-yellow-600 text-sm">Home</button>
            <span className="text-gray-400">/</span>
            <button onClick={() => navigate("/products")} className="text-gray-500 hover:text-yellow-600 text-sm">Products</button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 text-sm font-medium truncate">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LEFT — PRODUCT IMAGE */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="relative">
                <img
                  src={product.image?.url || "https://via.placeholder.com/400"}
                  alt={product.name}
                  className="rounded-xl w-full max-h-[500px] object-contain"
                />
                {product.stock > 0 ? (
                  <span className="absolute top-4 left-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ In Stock
                  </span>
                ) : (
                  <span className="absolute top-4 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT — DETAILS */}
            <div className="space-y-6">
              {/* Category */}
              <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.category?.replace(/-/g, ' ')}
              </span>

              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-lg ${star <= Math.round(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.numReviews || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-pink-600">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Description</h3>
                  <button
                    onClick={generateSummary}
                    disabled={generatingSummary}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition flex items-center gap-1"
                  >
                    <FaMagic size={10} />
                    {generatingSummary ? "Summarizing..." : "✨ AI Summary"}
                  </button>
                </div>
                {aiSummary ? (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm text-purple-800 whitespace-pre-line">{aiSummary}</p>
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                )}
              </div>

              {/* Stock Info */}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-green-600">
                  <FaShippingFast /> Fast Delivery
                </span>
                <span className="text-gray-600">
                  Available: <span className="font-semibold">{product.stock} units</span>
                </span>
              </div>

              {/* CUSTOMIZATION SECTION */}
              {product.isCustomizable && (
                <div className="p-5 rounded-xl border border-yellow-200 bg-yellow-50">
                  <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    ✨ Personalize Your Gift
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Custom Text (max 50 chars)
                      </label>
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value.slice(0, 50))}
                        placeholder="Enter name or message"
                        className="w-full border border-yellow-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Upload Custom Image
                      </label>
                      <label className="cursor-pointer bg-white border border-yellow-300 px-4 py-2 rounded-lg shadow-sm hover:bg-yellow-100 text-yellow-700 transition inline-block">
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCustomImage(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {customImage && (
                        <div className="mt-3 flex items-center gap-3">
                          <img
                            src={URL.createObjectURL(customImage)}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg shadow-md border"
                          />
                          <span className="text-sm text-gray-500">{customImage.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QUANTITY & ADD TO CART */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4 bg-white rounded-xl p-2 shadow-sm">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-10 h-10 bg-gray-100 rounded-lg text-xl font-bold hover:bg-gray-200 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-yellow-400 text-black rounded-lg text-xl font-bold hover:bg-yellow-500 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-semibold transition transform hover:scale-[1.02] ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-pink-600 text-white hover:bg-pink-700"
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  {addedToCart ? (
                    <>
                      <FaCheck /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <FaShoppingCart /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* REVIEWS SECTION */}
          <div className="mt-16 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-4xl font-bold text-pink-600">{product.rating?.toFixed(1) || 0}</p>
                <div className="flex justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`text-sm ${i < Math.round(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{product.numReviews || 0} reviews</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={i} className="p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-800">{r.name || "Anonymous"}</p>
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, j) => (
                          <FaStar key={j} className={j < r.rating ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
              )}
            </div>

            {/* Write Review */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4">Write a Review</h3>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform ${
                      star <= rating ? "text-yellow-400 scale-110" : "text-gray-300"
                    } hover:scale-125`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-yellow-400 outline-none"
                placeholder="Share your experience with this product..."
                rows={3}
              />
              <button
                onClick={handleSubmitReview}
                disabled={!rating || !comment || isSubmitting}
                className="mt-4 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <RelatedProduct currentProduct={product} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
