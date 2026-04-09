import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    
    // Also check Authorization header for token (for mobile/production fallback)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(400).json({ message: "User doesn't have token" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifyToken) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    req.userId = verifyToken.userId;

    const user = await User.findById(req.userId).select("firstName lastName email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; 

    next();
  } catch (error) {
    return res.status(500).json({ message: "isAuth error" });
  }
};
