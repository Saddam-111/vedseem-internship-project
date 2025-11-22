import validator from 'validator'
import { generateToken } from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import { generateAdminToken } from '../config/adminToken.js';
import { sendMail } from '../config/mail.js';




export const register = async (req, res) => {
  try {
    const { email, firstName, lastName, password, confirmPassword } = req.body;

    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid Email"
      })
    }

    //already exist
    const alreadyExist = await User.findOne({ email })
    if (alreadyExist) {
      return res.status(400).json({
        message: "Already exist"
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password and Confirm Passwor doesn't match"
      })
    }

    //hash
    const hashedPassword = await bcrypt.hash(password, 10)



    const user = await User.create({
      firstName,
      lastName,
      password: hashedPassword,
      email
    })

    const token = await generateToken(user._id)

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 3 * 24 * 60 * 60 * 1000
    })


    res.status(200).json({
      user,
      token
    })

    //validation
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User Signup failed"

    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields required"
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email"
      })
    }
    //alreday exist
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "No user found with this email"
      })
    }
    //compoare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect Password"
      })
    }

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 3 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      user,
      token
    })
  } catch (error) {
    res.status(500).json({
      message: "login failed"
    })
  }
}



export const googleLogin = async (req, res) => {
  try {
    let { name, email } = req.body;
    let user = await User.findOne({ email })
    if (!user) {
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ");

      user = await User.create({ firstName, lastName, email });

    }
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 3 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      user,
      token
    })

  } catch (error) {
    res.status(500).json({
      message: `Google login failed ${error}`,

    })
  }
}


export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,       // Only use true if running on HTTPS
      sameSite: "None", // Must match cookie options used during login
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signout failed",
    });
  }
};


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

      const token = await generateAdminToken(email)
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 1 * 24 * 60 * 60 * 1000
      })

      return res.status(200).json(token)
    } else {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Invalid credentials"
    })
  }
}

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

    // Always respond as if OTP was sent to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: `If the email is registered, an OTP has been sent.`,
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes from now
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