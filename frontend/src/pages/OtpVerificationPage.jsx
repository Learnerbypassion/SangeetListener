import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !otp) {
      return setError("Email and OTP are required");
    }

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      setSuccess("OTP verified successfully!");
      setTimeout(() => navigate("api/auth/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid OTP or OTP expired"
      );
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-950 via-gray-900 to-black px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Verify OTP
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Enter the 4-digit OTP sent to your email
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {!location.state?.email && (
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <input
            type="text"
            maxLength="4"
            placeholder="Enter OTP"
            className="w-full p-3 text-center tracking-widest text-xl rounded-xl bg-black/40 border border-white/10 text-white outline-none"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />

          <div className="text-center text-sm text-gray-400">
            {timeLeft > 0 ? (
              <span>OTP expires in {formatTime(timeLeft)}</span>
            ) : (
              <span className="text-red-400">OTP expired</span>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-400 text-sm text-center">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading || timeLeft <= 0}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationPage;