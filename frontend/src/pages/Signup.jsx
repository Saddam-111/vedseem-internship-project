import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import img from "../assets/image1.jpg";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";

function Signup() {
  const navigate = useNavigate();
  const { baseUrl, setUserData } = useContext(UserDataContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  const validateForm = () => {
    if (!formData.email || !formData.firstName || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await axios.post(baseUrl + "/api/v1/auth/register", formData, {
        withCredentials: true,
      });
      
      if (res.data.success) {
        setUserData(res.data.user);
        navigate("/");
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Signup failed. Please try again.");
      }
      console.error("Signup failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const name = user.displayName || "Google User";
      const email = user.email;

      const result = await axios.post(
        baseUrl + "/api/v1/auth/googleLogin",
        { email, name, photoURL: user.photoURL },
        { withCredentials: true }
      );
      
      if (result.data.success) {
        // Save token to localStorage as backup
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
        }
        setUserData(result.data.user);
        navigate("/");
      } else {
        setError(result.data.message || "Google signup failed");
      }
    } catch (error) {
      console.log(error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-up popup was closed");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Google sign-up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-600 font-bold mb-4 hover:text-gray-900 cursor-pointer"
            >
              <MdOutlineKeyboardBackspace size={30} /> Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Sign up to start shopping</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email *"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name *"
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password * (min 6 characters)"
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                  minLength={6}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password *"
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-2 text-sm text-gray-500">or continue with</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={googleSignup}
                type="button"
                disabled={loading}
                className="flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition disabled:opacity-50"
              >
                <FcGoogle size={24} />
                <span className="font-medium text-gray-700">
                  Continue with Google
                </span>
              </button>
            </div>

            <p className="text-sm text-gray-600 text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>

          <div className="hidden md:flex w-1/2 bg-yellow-400 items-center justify-center">
            <img src={img} alt="Signup" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Signup;