import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
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

  const handleGoogleSuccess = async (tokenResponse) => {
    setError("");
    setLoading(true);
    try {
      const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }).then(r => r.json());

      const res = await fetch("http://localhost:5000/api/auth/google-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInfo }),
      }).then(r => r.json());

      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("currentUser", JSON.stringify({ username: res.username, role: res.role, avatar: res.avatar }));
        if (res.role === "admin") {
          localStorage.setItem("adminAuth", "true");
          navigate("/dashboard");
        } else {
          localStorage.removeItem("adminAuth");
          navigate("/my-cases");
        }
      } else {
        setError(res.message || "Google sign-in failed.");
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google sign-in was cancelled or failed."),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        <div className="text-center mb-8">
          <img src="/speak.jpg" alt="SafeSpeak" className="h-10 mx-auto mb-3"
            onError={(e) => (e.target.style.display = "none")} />
          <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back to SafeSpeak</p>
          <p className="text-xs text-teal-600 mt-1 bg-teal-50 px-3 py-1.5 rounded-lg">
            Log in to view your case status and appointments
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-5 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or sign in with username</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

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
      </div>
    </div>
  );
};

export default Login;
