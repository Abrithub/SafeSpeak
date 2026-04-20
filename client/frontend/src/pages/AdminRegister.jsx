import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaUser, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { registerAdmin } from "../services/api";

const ADMIN_SECRET_KEY = "safespeak@2025"; // client-side pre-check only

const AdminRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // step 1: verify secret key, step 2: create account
  const [secretKey, setSecretKey] = useState("");
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const verifyKey = (e) => {
    e.preventDefault();
    if (secretKey === ADMIN_SECRET_KEY) {
      setError("");
      setStep(2);
    } else {
      setError("Invalid authorization key.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Admin password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    try {
      const res = await registerAdmin(form.username, form.password, secretKey);
      if (res.token) { setSuccess(true); setTimeout(() => navigate("/login"), 1800); }
      else setError(res.message || "Registration failed.");
    } catch { setError("Server unreachable. Please try again."); }
  };

  return (
    <div className="min-h-screen bg-[#1a2340] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#1a2340] p-3 rounded-xl">
            <FaShieldAlt className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a2340]">Admin Registration</h1>
            <p className="text-xs text-gray-500">Restricted — Authorized Personnel Only</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
            Admin account created. Redirecting to login...
          </div>
        )}

        {/* Step 1 — Secret key verification */}
        {step === 1 && (
          <form onSubmit={verifyKey} className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Enter the organization authorization key to proceed.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Authorization Key</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                  placeholder="Enter authorization key"
                  required
                />
              </div>
            </div>
            <button type="submit"
              className="w-full bg-[#1a2340] text-white py-2.5 rounded-lg font-medium hover:bg-[#243060] transition">
              Verify
            </button>
          </form>
        )}

        {/* Step 2 — Create admin account */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <p className="text-sm text-green-600 font-medium mb-2">✓ Authorization verified</p>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                  placeholder="Choose admin username" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type={showPw ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                  placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="password" value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                  placeholder="Repeat password" required />
              </div>
            </div>

            <button type="submit"
              className="w-full bg-[#1a2340] text-white py-2.5 rounded-lg font-medium hover:bg-[#243060] transition">
              Create Admin Account
            </button>
          </form>
        )}

        <p className="text-xs text-center text-gray-400 mt-6">
          *This page is not publicly linked. All registrations are logged.
        </p>
        <div className="text-center mt-2">
          <Link to="/login" className="text-xs text-sky-500 hover:underline">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
