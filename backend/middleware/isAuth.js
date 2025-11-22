import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(400).json({ message: "User doesn't have token" });
    }

    // Verify token
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    // Attach userId
    req.userId = verifyToken.userId;

    // ⭐ Fetch full user details (this is required for reviews)
    const user = await User.findById(req.userId).select("firstName lastName email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // ⭐ Attach user to request

    next();
  } catch (error) {
    return res.status(500).json({ message: "isAuth error" });
  }
};
