import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import About from "./pages/About";
import Question from "./pages/Question";
import Report from "./pages/Report";
import AgreementPage from "./pages/AgreementPage";

function AppLayout() {
  const [showContactPopup, setShowContactPopup] = useState(false);

  const toggleContactPopup = () => {
    setShowContactPopup(!showContactPopup);
  };

  return (
    <div>
      <Navbar onContactClick={toggleContactPopup} />
      <Outlet context={{ showContactPopup, toggleContactPopup }} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/agreement" replace />} />
        <Route path="/agreement" element={<AgreementPage />} />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Question />} />
          <Route path="/report" element={<Report />} />
          
          {/* Placeholder routes */}
          <Route path="/resources" element={<div className="pt-20 text-center text-gray-600">Resources Page (Coming Soon)</div>} />
          <Route path="/lang" element={<div className="pt-20 text-center text-gray-600">Language Page (Coming Soon)</div>} />
          <Route path="/signup" element={<div className="pt-20 text-center text-gray-600">Sign Up Page (Coming Soon)</div>} />
          <Route path="/login" element={<div className="pt-20 text-center text-gray-600">Login Page (Coming Soon)</div>} />
          <Route path="/take-down" element={<div className="pt-20 text-center text-gray-600">Take It Down Service (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;