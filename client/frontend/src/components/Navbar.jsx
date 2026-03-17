import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Left - with image */}
          <div className="flex items-center gap-2">
            <img 
              src="public/logo.png" 
              alt="SafeSpeak Logo" 
              className="h-8 w-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-xl font-bold text-sky-500">
              SafeSpeak
            </h1>
          </div>

          {/* Center Navigation - CyberTipline style */}
          <nav className="flex items-center space-x-8">
            <NavLink 
              to="/home" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? "text-sky-500 border-b-2 border-sky-500 pb-1" 
                    : "text-gray-700 hover:text-sky-500"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? "text-sky-500 border-b-2 border-sky-500 pb-1" 
                    : "text-gray-700 hover:text-sky-500"
                }`
              }
            >
              About Us
            </NavLink>

            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? "text-sky-500 border-b-2 border-sky-500 pb-1" 
                    : "text-gray-700 hover:text-sky-500"
                }`
              }
            >
              Contact Us
            </NavLink>

            <NavLink 
              to="/faq" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? "text-sky-500 border-b-2 border-sky-500 pb-1" 
                    : "text-gray-700 hover:text-sky-500"
                }`
              }
            >
              FAQ
            </NavLink>

            <NavLink 
              to="/resources" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? "text-sky-500 border-b-2 border-sky-500 pb-1" 
                    : "text-gray-700 hover:text-sky-500"
                }`
              }
            >
              Other Resources
            </NavLink>
          </nav>

          {/* Right side: language + auth - CyberTipline style */}
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <select 
              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer hover:text-sky-500 transition"
              defaultValue="en"
            >
              <option value="en">English (English)</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="om">Afaan Oromoo</option>
            </select>

            {/* Auth links */}
            <NavLink 
              to="/signup" 
              className="text-sm text-gray-700 hover:text-sky-500 transition"
            >
              Sign Up
            </NavLink>
            
            <NavLink
              to="/login"
              className="px-4 py-1.5 bg-sky-500 text-white text-sm font-medium rounded hover:bg-sky-600 transition"
            >
              Login
            </NavLink>

            {/* Quick Exit button - CyberTipline style */}
            <button
              onClick={() => {
                window.open("", "_self");
                window.close();
              }}
              className="px-4 py-1.5 bg-rose-500 text-white text-sm font-medium rounded hover:bg-rose-600 transition"
            >
              Quick Exit
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;