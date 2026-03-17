import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaShieldAlt, FaHandshake, FaCogs } from "react-icons/fa";

const About = () => {
  return (
    <div className="bg-white">
      {/* Remove min-h-screen */}
      
      {/* Hero Section with Diagonal Background */}
      <div className="relative bg-gradient-to-br from-slate-50 to-sky-50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-64 h-64 bg-sky-100 rounded-full opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100 rounded-full opacity-30 -z-10"></div>
        
        {/* Add padding top for navbar */}
        <div className="pt-16">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4">
                OUR PARTNERS
              </h1>
              <p className="text-xl text-sky-600 font-semibold mb-6">
                Together With Us
              </p>
              {/* 
              {/* Trust Image *
              <div className="flex justify-center mb-8">
                <img 
                  src="/trust.jpg" 
                  alt="Trust Partners" 
                  className="max-w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '120px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x120?text=Trust+Partners';
                  }}
                />
              </div> */}

              {/* Association Images Side by Side */}
              <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                {/* First Association Image */}
                <div className="flex-1 min-w-[200px] max-w-[280px]">
                  <img 
                    src="/association.png" 
                    alt="Association Signed 1" 
                    className="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow"
                    style={{ maxHeight: '160px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/280x160?text=Association+1';
                    }}
                  />
                </div>
                
                {/* Second Association Image */}
                <div className="flex-1 min-w-[200px] max-w-[280px]">
                  <img 
                    src="/child.png" 
                    alt="Association Signed 2" 
                    className="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow"
                    style={{ maxHeight: '160px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/280x160?text=Association+2';
                    }}
                  />
                </div>
              </div>

              <p className="text-sm text-slate-500 italic mb-8">
                Official partnership agreements and association memberships
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Main Message */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                  What makes us a <span className="text-sky-500">Trusted Partner?</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-sky-500 text-xl mt-1 flex-shrink-0" />
                    <p className="text-lg text-slate-700">We are committed to quality.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-sky-500 text-xl mt-1 flex-shrink-0" />
                    <p className="text-lg text-slate-700">We believe in transparency.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-sky-500 text-xl mt-1 flex-shrink-0" />
                    <p className="text-lg text-slate-700">Scalable Toll Manufacturing Solutions.</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-sky-500 text-xl mt-1 flex-shrink-0" />
                    <p className="text-lg text-slate-700">We provide end-to-end solutions.</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Value Props with Icons */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                  <FaShieldAlt className="text-sky-500 text-3xl mb-3" />
                  <h3 className="font-semibold text-slate-800">Quality First</h3>
                  <p className="text-sm text-slate-600">Committed to excellence</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                  <FaHandshake className="text-sky-500 text-3xl mb-3" />
                  <h3 className="font-semibold text-slate-800">Transparency</h3>
                  <p className="text-sm text-slate-600">Clear communication</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                  <FaCogs className="text-sky-500 text-3xl mb-3" />
                  <h3 className="font-semibold text-slate-800">Scalable</h3>
                  <p className="text-sm text-slate-600">Grow with us</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                  <FaCheckCircle className="text-sky-500 text-3xl mb-3" />
                  <h3 className="font-semibold text-slate-800">End-to-End</h3>
                  <p className="text-sm text-slate-600">Complete solutions</p>
                </div>
              </div>
            </div>

            {/* Bottom Banner */}
            <div className="mt-16 bg-sky-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    EMPOWERING YOUR GROWTH WITH RELIABLE SOLUTIONS
                  </h3>
                  <Link 
                    to="/contact" 
                    className="inline-block bg-white text-sky-600 px-8 py-3 rounded-full font-semibold hover:bg-sky-50 transition"
                  >
                    Explore →
                  </Link>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-medium">abbetterment@gmail.com</p>
                  <p className="text-2xl font-bold">022-46134613</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add some bottom padding for better scrolling */}
      <div className="h-10"></div>
    </div>
  );
};

export default About;