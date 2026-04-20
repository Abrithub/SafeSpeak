import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaUser } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple demo credentials
    if (form.username === "admin" && form.password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Try admin / admin123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a2340]">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#1a2340] p-3 rounded-xl">
            <FaLock className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a2340]">SafeSpeak Admin</h1>
            <p className="text-xs text-gray-500">Authorized Access Only</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign In</h2>
        <p className="text-sm text-gray-500 mb-6">
          Women & Children Affairs / Police / Partner NGOs
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a2340] text-white py-2.5 rounded-lg font-medium hover:bg-[#243060] transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          *All access is monitored and logged
        </p>
        <div className="text-center mt-3">
          <Link to="/home" className="text-xs text-sky-500 hover:underline">
            ← Back to SafeSpeak
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
