// Login.jsx
import React, { useState, useContext } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import img from "../assets/image.jpg";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/Firebase";

function Login() {
  const navigate = useNavigate();
  const { baseUrl, setUserData } = useContext(UserDataContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(baseUrl + "/api/v1/auth/login", formData, {
        withCredentials: true,
      });
      setUserData(res.data.user);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      const response = await signInWithPopup(auth, provider)
      let user = response.user 
      let name = user.displayName
      let email = user.email

      const result = await axios.post(baseUrl + '/api/v1/auth/googleLogin', {name, email}, {withCredentials: true})
      setUserData(result.data.user)
      navigate('/')
      console.log(result.data)

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row">
        {/* Left Section (Image) */}
        <div className="hidden lg:flex w-1/2 bg-yellow-400 items-center justify-center p-6">
          <img
            src={img}
            alt="Login Illustration"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right Section (Form) */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center relative">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 cursor-pointer font-medium mb-4 hover:text-gray-900"
          >
            <MdOutlineKeyboardBackspace size={30} /> Back
          </button>

          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-6">
            Login to explore{" "}
            <span className="font-semibold text-yellow-600">our store</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-2 text-sm text-gray-500">or continue with</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Only Google Login */}
          <div className="flex justify-center rounded-md py-1">
            <button
                type="button"
                onClick={googleLogin}
                className="flex items-center gap-2 border border-gray-300 px-6 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition"
              >
                <FcGoogle size={24} /> 
                <span className="font-medium text-gray-700">Continue with Google</span>
              </button>
          </div>

          {/* Links */}
          <p className="text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500">
              Sign up
            </Link>
          </p>
          <Link
            to="/forgot-password"
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
