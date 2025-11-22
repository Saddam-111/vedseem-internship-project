// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true, // allows multiple nulls but unique emails
    },
    password: {
      type: String, // for normal signup (hashed password)
      required: false,
    },
  cartData: {
    type: Map,
    of: Number,
    default: {},
  },
  
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetOtp: {
      type: String,
    },
    otpExpires: {
      type: Date
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User
