import validator from 'validator'
import { generateToken } from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import { generateAdminToken } from '../config/adminToken.js';
import { sendMail } from '../config/mail.js';




export const register = async (req, res) => {
  try {
    const { email, firstName, lastName, password, confirmPassword } = req.body;

    if (!email || !firstName || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid Email"
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password and Confirm Password doesn't match"
      })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
      password: hashedPassword,
      email: email.toLowerCase().trim()
    })

    const token = await generateToken(user._id)

    res.cookie("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })


    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "User registration failed"
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Please login with Google"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = await generateToken(user._id);
    
    res.cookie("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    })
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    })
  }
}



export const googleLogin = async (req, res) => {
  try {
    let { name, email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      const [firstName, ...rest] = name ? name.split(" ") : ['Google'];
      const lastName = rest.join(" ");

      user = await User.create({ 
        firstName: firstName || 'Google',
        lastName: lastName || '',
        email: email.toLowerCase(),
        googleId: `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        avatar: req.body.photoURL || ''
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = await generateToken(user._id);
    
    res.cookie("token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Google login failed"
    });
  }
}


export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: "/",      
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      })
    }

    const token = await generateAdminToken(email)
    
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token
    })
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Admin login failed"
    })
  }
}

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: "/"
    });
    return res.status(200).json({ 
      success: true,
      message: "Admin logged out successfully" 
    });
  } catch (error) {
    console.error("Admin logout error:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Logout failed" 
    });
  }
};

//forgot password

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const user = await User.findOne({ email });


    if (!user) {
      return res.status(200).json({
        success: true,
        message: `If the email is registered, an OTP has been sent.`,
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; 
    user.isOtpVerified = false;

    await user.save();
    await sendMail(email, otp);

    return res.status(200).json({
      success: true,
      message: `If the email is registered, an OTP has been sent.`,
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      user.isOtpVerified ||
      user.resetOtp !== otp ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};