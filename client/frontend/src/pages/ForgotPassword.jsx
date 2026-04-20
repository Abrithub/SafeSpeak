import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { forgotPassword, resetPassword } from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code+new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await forgotPassword(email);
      if (res.message && !res.message.toLowerCase().includes("no account")) {
        setStep(2);
        setSuccess("Reset code sent to your email.");
      } else {
        setError(res.message || "Failed to send reset code.");
      }
    } catch { setError("Server unreachable."); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const res = await resetPassword(email, code, newPassword);
      if (res.message === "Password reset successfully") {
        setSuccess("Password reset! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.message || "Reset failed.");
      }
    } catch { setError("Server unreachable."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaLock className="text-sky-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? "Enter your email to receive a reset code" : "Enter the code sent to your email"}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="your@email.com" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-sky-500 text-white py-2.5 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Reset Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="000000" maxLength={6} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="Min. 6 characters" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-sky-500 text-white py-2.5 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-60">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button type="button" onClick={() => setStep(1)}
              className="w-full text-sm text-gray-400 hover:text-gray-600">
              ← Back
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-xs text-sky-500 hover:underline">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
