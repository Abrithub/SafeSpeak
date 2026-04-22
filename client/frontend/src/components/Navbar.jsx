import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { changeLanguage, getSavedLang, LANGUAGES } from "../utils/translate";

const Navbar = () => {
  const [lang, setLang] = useState(getSavedLang());
  const navigate = useNavigate();

  const handleLangChange = (e) => {
    const code = e.target.value;
    setLang(code);
    changeLanguage(code);
  };

  const scrollTo = (id) => {
    // If not on home, navigate there first then scroll
    if (!window.location.pathname.includes("/home") &&
        !window.location.pathname.includes("/about") &&
        !window.location.pathname.includes("/faq") &&
        !window.location.pathname.includes("/how-to-report")) {
      navigate("/home");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-1 shadow-sm overflow-hidden" style={{ width: 48, height: 48 }}>
              <img 
                src="/speak.jpg" 
                alt="SafeSpeak Logo" 
                className="w-full h-full object-cover object-center scale-[2.2]"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <h1 className="text-xl font-bold text-sky-500">
              SafeSpeak
            </h1>
          </div>

          {/* NAV LINKS */}
          <nav className="flex items-center space-x-8">

            <button onClick={() => scrollTo("home")}
              className="text-sm font-medium text-gray-700 hover:text-sky-500 transition">
              Home
            </button>

            <button onClick={() => scrollTo("about")}
              className="text-sm font-medium text-gray-700 hover:text-sky-500 transition">
              About Us
            </button>

            {/* CONTACT DROPDOWN */}
            <div className="relative group">
              <button className="text-sm font-medium text-gray-700 hover:text-sky-500 flex items-center gap-1">
                Contact Us
                <FaChevronDown className="text-xs mt-[2px]" />
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-[550px] bg-white border border-gray-200 rounded-xl shadow-xl
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible
                              transition-all duration-200 z-50">
                <div className="grid grid-cols-2 gap-6 p-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">📞 Call Support</h3>
                    <a href="tel:+251965485715" className="block text-sky-500 text-sm hover:underline mb-1">+251 965 485 715</a>
                    <a href="tel:+251987240570" className="block text-sky-500 text-sm hover:underline mb-1">+251 987 240 570</a>
                    <a href="tel:+251909853958" className="block text-sky-500 text-sm hover:underline mb-1">+251 909 853 958</a>
                    <p className="text-xs text-gray-500 mt-2">24/7 emergency response available</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">✉️ Email Us</h3>
                    <a href="mailto:support@safespeak.org" className="block text-sky-500 text-sm hover:underline mb-1">support@safespeak.org</a>
                    <a href="mailto:emergency@safespeak.org" className="block text-sky-500 text-sm hover:underline">emergency@safespeak.org</a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">💬 Messaging</h3>
                    <a href="https://wa.me/251960255733" target="_blank" rel="noopener noreferrer" className="block text-sky-500 text-sm hover:underline mb-1">WhatsApp Chat</a>
                    <a href="https://t.me/safespeak_support" target="_blank" rel="noopener noreferrer" className="block text-sky-500 text-sm hover:underline">Telegram Support</a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">📩 SMS</h3>
                    <a href="sms:+251960255733" className="block text-sky-500 text-sm hover:underline">Send SMS Message</a>
                    <p className="text-xs text-gray-500 mt-2">Fast response within minutes</p>
                  </div>
                </div>
                <div className="bg-rose-50 px-6 py-3 rounded-b-xl border-t">
                  <p className="text-xs text-rose-600 font-medium">⚠ Immediate danger?</p>
                  <p className="text-xs text-gray-600">Call local police or emergency services immediately</p>
                </div>
              </div>
            </div>

            {/* placeholder - contact dropdown removed, now scrolls to section */}

            <button onClick={() => scrollTo("faq")}
              className="text-sm font-medium text-gray-700 hover:text-sky-500 transition">
              FAQ
            </button>

            <button onClick={() => scrollTo("contact")}
              className="text-sm font-medium text-gray-700 hover:text-sky-500 transition">
              Contact
            </button>

          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center space-x-4">

            <select
              value={lang}
              onChange={handleLangChange}
              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer hover:text-sky-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

            <NavLink 
              to="/signup"
              className="text-sm text-gray-700 hover:text-sky-500"
            >
              Sign Up
            </NavLink>

            <button
              onClick={() => {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
                if (token && user.role === "reporter") navigate("/my-cases");
                else navigate("/login");
              }}
              className="text-sm text-gray-700 hover:text-sky-500"
            >
              My Cases
            </button>

            <NavLink
              to="/login"
              className="px-4 py-1.5 bg-sky-500 text-white text-sm font-medium rounded hover:bg-sky-600"
            >
              Login
            </NavLink>

            <button
              onClick={() => {
                window.open("", "_self");
                window.close();
              }}
              className="px-4 py-1.5 bg-rose-500 text-white text-sm font-medium rounded hover:bg-rose-600"
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