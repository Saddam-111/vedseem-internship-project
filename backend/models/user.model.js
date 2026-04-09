
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
      minlength: [1, "First name must be at least 1 character"]
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },
    password: {
      type: String, 
      required: function() { return !this.googleId; },
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    avatar: {
      type: String,
      default: ""
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
      select: false
    },
    otpExpires: {
      type: Date,
      select: false
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.resetOtp;
        delete ret.otpExpires;
        delete ret.isOtpVerified;
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.resetOtp;
        delete ret.otpExpires;
        delete ret.isOtpVerified;
        return ret;
      }
    }
  }
);

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User
