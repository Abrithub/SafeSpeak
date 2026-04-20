import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import ChatBot from "./components/ChatBot.jsx";
import Report from "./pages/Report";
import AgreementPage from "./pages/AgreementPage";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import MyCases from "./pages/MyCases.jsx";
import TrackCase from "./pages/TrackCase.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function AppLayout() {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const toggleContactPopup = () => setShowContactPopup(!showContactPopup);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onContactClick={toggleContactPopup} />
      <main className="flex-1">
        <Outlet context={{ showContactPopup, toggleContactPopup }} />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/agreement" replace />} />
        <Route path="/agreement" element={<AgreementPage />} />

        {/* Public pages with Navbar */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<LandingPage />} />
          <Route path="/about" element={<LandingPage />} />
          <Route path="/faq" element={<LandingPage />} />
          <Route path="/how-to-report" element={<LandingPage />} />
          <Route path="/report" element={<Report />} />
          <Route path="/resources" element={<div className="pt-20 text-center text-gray-600 py-20">Resources Page (Coming Soon)</div>} />
          <Route path="/take-down" element={<div className="pt-20 text-center text-gray-600 py-20">Take It Down Service (Coming Soon)</div>} />
        </Route>

        {/* Auth & reporter pages — no Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/my-cases" element={<MyCases />} />
        <Route path="/track" element={<TrackCase />} />

        {/* Admin dashboard — no Navbar */}
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>

      {/* Global floating chatbot — visible on all pages */}
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;
