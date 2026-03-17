import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaQuestionCircle, FaClock, FaGlobe } from 'react-icons/fa';

const Report = () => {
  const [formData, setFormData] = useState({
    reportingFor: '',
    incidentDate: '',
    incidentTime: '',
    timezone: '',
    incidentType: '',
    incidentLocation: '',
    description: '',
    victimAge: '',
    suspectInfo: '',
    consentGiven: false
  });

  const [currentSection, setCurrentSection] = useState(1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRadioChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextSection = () => {
    setCurrentSection(prev => Math.min(prev + 1, 3));
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header - Like in screenshot */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Report Child Sexual Exploitation
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <Link to="/resources" className="hover:text-sky-600">Other Resources</Link>
            <span>•</span>
            <Link to="/faq" className="hover:text-sky-600">FAQ</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-sky-600">Contact Us</Link>
            <span>•</span>
            <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none">
              <option>English (English)</option>
              <option>አማርኛ (Amharic)</option>
              <option>Afaan Oromoo</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sky-600">Section {currentSection} of 3</span>
            <span className="text-sm text-gray-500">Your progress is saved privately</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Take it Down Section - Like in screenshot */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <FaShieldAlt className="text-blue-500 text-2xl flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Take it Down</h2>
              <p className="text-gray-700 mb-3">
                Having rules online is scary, but there is hope to get it taken down. The Take It Down service is one step you can take to help remove online hate, partially nudity, or sexually explicit photos and videos taken before you were 18.
              </p>
              <p className="font-medium text-gray-800 mb-3">
                Have images and videos you'd like to have taken down?
              </p>
              <Link to="/take-down" className="inline-block text-sky-600 font-medium hover:underline mb-4">
                Visit here to learn more →
              </Link>
              <p className="text-gray-600 text-sm">
                If you prefer to speak to someone directly, you can contact the National Center for Missing & Exploited Children's Call Center. We are available 24 hours a day, 7 days a week.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <form className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          
          {/* Section 1: Basic Information */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                Incident Details
              </h3>

              {/* I am reporting something that happened to: */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am reporting something that happened to: <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Myself', 'Someone I know', 'Neither; a URL where explicit content was posted regarding someone I don’t know', 'Neither; some other activity I saw or heard but I don’t know the victim'].map((option) => (
                    <label key={option} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="reportingFor"
                        value={option}
                        checked={formData.reportingFor === option}
                        onChange={(e) => handleRadioChange('reportingFor', option)}
                        className="w-4 h-4 text-sky-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* When did the most recent incident happen? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When did the most recent incident happen? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['It hasn’t occurred yet', 'Yesterday / today / now', 'Less than 1 month ago', 'Between 1 month and 6 months ago', 'Between 6 months and 1 year ago', 'Over a year ago', 'I don’t know'].map((option) => (
                    <label key={option} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="incidentDate"
                        value={option}
                        checked={formData.incidentDate === option}
                        onChange={(e) => handleRadioChange('incidentDate', option)}
                        className="w-4 h-4 text-sky-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Please provide the approximate date and time */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Please provide the approximate date and time of the most recent incident. If you cannot remember the most recent date, provide a date and time to the best of your knowledge.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date</label>
                    <input
                      type="date"
                      name="incidentDate"
                      value={formData.incidentDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Time (approx)</label>
                    <input
                      type="time"
                      name="incidentTime"
                      value={formData.incidentTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Additional Details */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                Additional Information
              </h3>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please provide the approximate time zone
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select time zone</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="CST">Central Time (CST)</option>
                    <option value="MST">Mountain Time (MST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="UTC">UTC</option>
                    <option value="GMT">GMT</option>
                    <option value="IST">Indian Standard Time (IST)</option>
                    <option value="EAT">East Africa Time (EAT)</option>
                  </select>
                </div>
              </div>

              {/* Was this incident: */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Was this incident: <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {['One-time', 'Ongoing'].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="incidentType"
                        value={option}
                        checked={formData.incidentType === option}
                        onChange={(e) => handleRadioChange('incidentType', option)}
                        className="w-4 h-4 text-sky-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Where did the incident happen? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Where did the incident happen? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {['Online', 'Offline'].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="incidentLocation"
                        value={option}
                        checked={formData.incidentLocation === option}
                        onChange={(e) => handleRadioChange('incidentLocation', option)}
                        className="w-4 h-4 text-sky-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please describe what happened (be as specific as possible)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Provide details about the incident, including any relevant information..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Section 3: Final Information */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                Final Details
              </h3>

              {/* Victim age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approximate age of victim (if known)
                </label>
                <input
                  type="text"
                  name="victimAge"
                  value={formData.victimAge}
                  onChange={handleChange}
                  placeholder="e.g., 15, 16-17, unknown"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Suspect information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Information about suspect (if known)
                </label>
                <textarea
                  name="suspectInfo"
                  value={formData.suspectInfo}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Any details about the person involved - username, name, appearance, etc."
                ></textarea>
              </div>

              {/* Consent checkbox */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consentGiven"
                    checked={formData.consentGiven}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-sky-500"
                  />
                  <span className="text-sm text-gray-600">
                    I understand that this report will be reviewed by professionals and may be shared with law enforcement if necessary. I confirm that the information provided is accurate to the best of my knowledge. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={prevSection}
              disabled={currentSection === 1}
              className={`px-6 py-2 rounded-lg transition ${
                currentSection === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {currentSection < 3 ? (
              <button
                type="button"
                onClick={nextSection}
                className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Submit Report
              </button>
            )}
          </div>
        </form>

        {/* Search Section - Like in screenshot */}
        <div className="mt-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search the web and Windows"
              className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <FaQuestionCircle className="inline-block mr-1" />
          Need help? <Link to="/contact" className="text-sky-600 hover:underline">Contact our support team</Link>
        </div>
      </div>
    </div>
  );
};

export default Report;