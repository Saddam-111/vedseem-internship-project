import express from "express";
import { addReview, getReviews } from "../controllers/review.controllers.js";
import { isAuth } from "../middleware/isAuth.js";

export const reviewRouter = express.Router();

reviewRouter.post("/:productId", isAuth, addReview);
reviewRouter.get("/:productId", getReviews);
