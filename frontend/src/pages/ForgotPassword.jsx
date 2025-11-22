import React, { useContext, useState } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { baseUrl } = useContext(UserDataContext);
  const navigate = useNavigate();

  // Handle sending OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await axios.post(`${baseUrl}/api/v1/auth/sendOtp`, { email });
      setSuccess(resp.data.message || "OTP sent!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await axios.post(`${baseUrl}/api/v1/auth/verifyOtp`, {
        email,
        otp,
      });
      setSuccess(resp.data.message || "OTP verified!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resetting password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const resp = await axios.post(`${baseUrl}/api/v1/auth/resetPassword`, {
        email,
        password: newPassword,
      });
      setSuccess(resp.data.message || "Password reset successful!");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-yellow-100 to-white">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 border border-yellow-200">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-400 shadow-md">
            <span className="text-white text-2xl font-bold">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-yellow-600 mt-4">
            {step === 1
              ? "Forgot Password"
              : step === 2
              ? "Verify OTP"
              : "Reset Password"}
          </h2>
          <p className="text-gray-500 text-sm text-center mt-2">
            {step === 1 &&
              "Enter your registered email and we’ll send you an OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Set your new password below"}
          </p>
        </div>

        {/* Step 1 - Request OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label className="block mb-2 font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full px-4 py-2 border border-yellow-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-semibold shadow-md hover:bg-yellow-600 active:scale-95 transition"
            >
              {loading ? "Processing..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2 - Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <label className="block mb-2 font-medium text-gray-700">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-4 py-2 border border-yellow-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-semibold shadow-md hover:bg-yellow-600 active:scale-95 transition"
            >
              {loading ? "Processing..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* Step 3 - Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <label className="block mb-2 font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-yellow-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
            />
            <label className="block mb-2 font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-yellow-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-semibold shadow-md hover:bg-yellow-600 active:scale-95 transition"
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Footer */}
        {step === 1 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-yellow-600 hover:underline cursor-pointer"
            >
              Go back to login
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
