import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";
import { AdminDataContext } from "../context/AdminContext";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { baseUrl } = useContext(AuthDataContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { getAdmin } = useContext(AdminDataContext);

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        baseUrl + "/api/v1/auth/adminLogin",
        { email, password },
        { withCredentials: true }
      );
      getAdmin();
      navigate("/");
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo / Title */}
        <h1 className="text-3xl font-extrabold text-center mb-6">
          <span className="text-indigo-700">Admin</span>{" "}
          <span className="text-yellow-500">Panel</span>
        </h1>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="block text-xl font-semibold text-gray-800">
            Login to Continue
          </span>
          <span className="block text-gray-500">
            Welcome back! Manage{" "}
            <span className="text-indigo-700 font-semibold">your dashboard</span>
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSignin} className="space-y-5">
          <div className="space-y-4">
            {/* Email */}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-3 rounded-lg font-semibold shadow-md transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Trouble logging in?{" "}
          <span className="text-indigo-700 cursor-pointer hover:underline">
            Contact support
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
