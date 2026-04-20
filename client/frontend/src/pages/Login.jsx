import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form.username, form.password);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("currentUser", JSON.stringify({ username: res.username, role: res.role }));
        if (res.role === "admin") {
          localStorage.setItem("adminAuth", "true");
          navigate("/dashboard");
        } else {
          localStorage.removeItem("adminAuth");
          navigate("/my-cases");
        }
      } else {
        setError(res.message || "Invalid username or password.");
      }
    } catch {
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        <div className="text-center mb-8">
          <img src="/speak.jpg" alt="SafeSpeak" className="h-10 mx-auto mb-3"
            onError={(e) => (e.target.style.display = "none")} />
          <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back to SafeSpeak</p>
          <p className="text-xs text-teal-600 mt-1 bg-teal-50 px-3 py-1.5 rounded-lg">
            Reporters: log in to view your case status and appointments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="text" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Enter your username" required autoComplete="username" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type={showPw ? "text" : "password"} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Enter your password" required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-sky-500 text-white py-2.5 rounded-lg font-medium hover:bg-sky-600 transition mt-2 disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-sky-500 font-medium hover:underline">Sign Up</Link>
        </p>
        <p className="text-center text-sm mt-2">
          <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-sky-500">Forgot password?</Link>
        </p>
        <div className="text-center mt-2">
          <Link to="/home" className="text-xs text-gray-400 hover:underline">← Back to Home</Link>
        </div>
        <p className="text-xs text-center text-gray-400 mt-4">
          *All sessions are encrypted and monitored
        </p>
      </div>
    </div>
  );
};

export default Login;
