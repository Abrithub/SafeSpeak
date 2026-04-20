import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaComments, FaBolt, FaPhoneAlt } from "react-icons/fa";

const Home = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowWarning(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Remove min-h-screen from main container */}
      
      {/* BACKGROUND LAYER (pure white, diagonals provide color) */}
      <div className="absolute inset-0 bg-white -z-30"></div>

      {/* DIAGONAL COLOR BLOCKS ON EDGES - RESTORED */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-200 rounded-3xl rotate-[-10deg] -z-10"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-100 rounded-3xl rotate-[12deg] -z-10"></div>

      {/* VERY SUBTLE DOTS LEFT (ALMOST WHITE) - RESTORED */}
      <div className="absolute top-0 left-0 grid grid-cols-6 gap-2 opacity-20 -z-10">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gray-200 rounded-full"
          ></div>
        ))}
      </div>

      {/* VERY SUBTLE DOTS RIGHT (ALMOST WHITE) - RESTORED */}
      <div className="absolute bottom-10 right-8 grid grid-cols-5 gap-2 opacity-20 -z-10">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gray-200 rounded-full"
          ></div>
        ))}
      </div>

      {/* TOP-RIGHT RECTANGLE ACCENT - RESTORED */}
      <div className="absolute right-0 top-0 w-[260px] h-[160px] bg-sky-100 rounded-bl-3xl -z-20"></div>

      {/* Main content - add padding top for navbar */}
      <div className="pt-16 relative z-0">
        <div className="max-w-6xl mx-auto px-4">

          {/* HERO SECTION - Reduced gap */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-6">

            {/* LEFT SIDE */}
            <div className="lg:w-1/2">

              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Interactive, Secure and Speak Freely
              </h1>

              <p className="text-gray-600 mb-6">
                SafeSpeak allows individuals to safely report abuse and harmful
                incidents while maintaining privacy and security. Our platform
                ensures responsible reporting and faster support when needed.
              </p>

              {/* PRIMARY ACTIONS - Updated with Link to HowToReport page */}
              <div className="flex items-center gap-6">

                <Link
                  to="/report"
                  className="bg-sky-400 text-white px-6 py-3 rounded-lg hover:bg-sky-500 transition inline-block"
                >
                  Report Incident
                </Link>

                <Link
                  to="/how-to-report"  // Changed from "/faq" to "/how-to-report"
                  className="text-sky-500 font-medium hover:underline"
                >
                  See how to report?
                </Link>

              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="lg:w-1/2 flex flex-col items-center">

              <div className="w-[420px] h-[280px] rounded-xl overflow-hidden flex items-center justify-center shadow-md bg-slate-200">
                <img
                  src="/hero.png"
                  alt="SafeSpeak hero"
                  className="w-full h-full object-cover"
                />
              </div>

            </div>

          </div>

          {/* URGENT SECTION - Reduced top margin and padding */}
          <div className="mt-8 bg-white shadow-lg py-8 rounded-xl">

            <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto px-6">

              {/* CALL SIDE */}
              <div className="text-center md:text-left flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-500">
                  <FaPhoneAlt className="text-lg" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-0.5">
                    Call Now For Urgent Incident
                  </h2>

                  <p className="text-lg font-semibold text-sky-500">
                    +251 911 123 456
                  </p>
                </div>

              </div>

              {/* ICONS - Reduced gap */}
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <FaShieldAlt className="text-sky-400 text-xl mb-0.5" />
                  <span className="text-gray-700 text-xs">Secure</span>
                </div>

                <div className="flex flex-col items-center">
                  <FaComments className="text-sky-400 text-xl mb-0.5" />
                  <span className="text-gray-700 text-xs">Interactive</span>
                </div>

                <div className="flex flex-col items-center">
                  <FaBolt className="text-sky-400 text-xl mb-0.5" />
                  <span className="text-gray-700 text-xs text-center">
                    Fast Response
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* CALL DIRECTLY BANNER - FULL WIDTH - Reduced top margin */}
        <section className="mt-8 w-full bg-[#fbf3e9]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Left image */}
              <div className="md:col-span-2 relative h-[240px] md:h-[280px] bg-[#f4ddc6] overflow-hidden">
                <img
                  src="/callus.png"
                  alt="Call us"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Content - Reduced padding */}
              <div className="md:col-span-3 p-5 md:p-6 flex items-center justify-between gap-4">
                <div className="max-w-xl">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-tight">
                    If you prefer to speak to someone directly,
                  </h2>
                  <p className="mt-1 text-slate-600 text-sm">
                    you can contact our Call Center for immediate help and guidance.
                  </p>

                  <p className="mt-3 text-rose-600 font-semibold text-sm">
                    We are available 24 hours a day, 7 days a week.
                  </p>

                  <a
                    href="tel:+251911123456"
                    className="mt-1 inline-block text-slate-800 underline underline-offset-4 font-medium text-sm"
                  >
                    +251 911 123 456
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.open("", "_self");
                    window.close();
                  }}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-white font-semibold shadow hover:bg-rose-400 transition text-sm"
                >
                  Quick Exit
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Reduced bottom padding */}
        <div className="h-6"></div>
      </div>

      {/* SLIDE-IN WARNING POPUP */}
      <div
        className={`fixed bottom-6 right-4 max-w-sm w-[320px] bg-white shadow-xl border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3 transition-transform transition-opacity duration-300 ${
          showWarning ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="mt-1 h-8 w-1.5 rounded-full bg-red-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-600">
            የሕግ ማስጠንቀቂያ
          </p>
          <div className="text-xs text-gray-700 mt-1 space-y-1.5">
            <p className="leading-snug">
              False or misleading abuse reports may lead to legal consequences.
            </p>
            <p className="leading-snug">
              የሐሰት ወይም የተሳሳተ የጥቃት መግለጫ በሕግ መወሰን ይችላል።
            </p>
            <p className="leading-snug">
              Himanni badii sobaa yookaan wallaalummaa qabu seeraan qoratamuun adabbii fiduu dandaʼa.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowWarning(false)}
          className="ml-1 text-xs text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

    </div>
  );
};

export default Home;