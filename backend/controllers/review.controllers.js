import Product from "../models/product.model.js";

export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const userId = req.userId;
  const productId = req.params.productId;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Prevent multiple reviews by same user
  const alreadyReviewed = product.reviews.find(
    (r) => r.userId.toString() === userId.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: "You already reviewed this product" });
  }

  // Fetch user name
  const user = req.user; // from isAuth middleware

  const review = {
    userId,
    name: user.firstName + " " + user.lastName,
    rating,
    comment,
  };

  product.reviews.push(review);

  // Recalculate rating
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({ message: "Review added", reviews: product.reviews });
};

export const getReviews = async (req, res) => {
  const productId = req.params.productId;

  const product = await Product.findById(productId).select("reviews rating numReviews");
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json({
    reviews: product.reviews,
    rating: product.rating,
    numReviews: product.numReviews,
  });
};
