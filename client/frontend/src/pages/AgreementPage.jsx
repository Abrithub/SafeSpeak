import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AgreementPage = () => {
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">

      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">

        <h1 className="text-3xl font-bold mb-4 text-red-600">
          SafeSpeak Platform
        </h1>

        <p className="text-gray-600 mb-6">
          This platform allows victims to report abuse safely and anonymously.
          False reporting may lead to legal consequences according to legal regulations.
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <input
            type="checkbox"
            className="w-5 h-5"
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span className="text-sm">I agree to the terms and conditions</span>
        </div>

        <div className="flex justify-center gap-4">

          <button
            disabled={!agree}
            onClick={() => navigate("/home")}
            className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
              agree
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Enter Platform
          </button>

          <button
            onClick={() => window.close()}
            className="px-6 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
          >
            Exit
          </button>

        </div>

      </div>

    </div>
  );
};

export default AgreementPage;
