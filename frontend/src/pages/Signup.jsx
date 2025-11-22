import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { FcGoogle } from "react-icons/fc"; // Google Icon
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import img from "../assets/image1.jpg";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";

function Signup() {
  const navigate = useNavigate();
  const { baseUrl, setUserData } = useContext(UserDataContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ State to hold error messages

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors on a new submission

    // ✅ Client-side validation for password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return; // Stop the submission
    }

    try {
      setLoading(true);
      const res = await axios.post(baseUrl + "/api/v1/auth/register", formData, {
        withCredentials: true,
      });
      setUserData(res.data.user);
      console.log(res.data);
      console.log(res.data.user);
      navigate("/"); // Navigate to home on successful signup
    } catch (err) {
      // ✅ Set error message from backend response
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Signup failed. Please try again later.");
      }
      console.error("Signup failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const name = user.displayName;
      const email = user.email;

      const result = await axios.post(
        baseUrl + "/api/v1/auth/googleLogin",
        { email, name },
        { withCredentials: true }
      );
      setUserData(result.data.user);
      navigate("/");
      console.log(result.data);
    } catch (error) {
      console.log(error);
      setError("Google signup failed. Please try again."); // ✅ Error feedback for Google signup
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
          {/* Left Section (Form) */}
          <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-600 font-bold mb-4 hover:text-gray-900 cursor-pointer"
            >
              <MdOutlineKeyboardBackspace size={30} /> Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Sign up to start shopping</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                required
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
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
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                  required
                />
              </div>

              {/* ✅ Display Error Message Here */}
              {error && (
                <p className="text-red-500 text-sm text-center font-semibold">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition disabled:bg-gray-300"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-2 text-sm text-gray-500">or continue with</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            {/* Google Signup */}
            <div className="flex justify-center">
              <button
                onClick={googleSignup}
                type="button"
                className="flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition"
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

          {/* Right Section (Image) */}
          <div className="hidden md:flex w-1/2 bg-yellow-400 items-center justify-center">
            <img src={img} alt="Signup" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Signup;