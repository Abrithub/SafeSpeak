import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Question = () => {
  const [openSection, setOpenSection] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
      setOpenQuestion(null);
    } else {
      setOpenSection(section);
      setOpenQuestion(null);
    }
  };

  const toggleQuestion = (question) => {
    if (openQuestion === question) {
      setOpenQuestion(null);
    } else {
      setOpenQuestion(question);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Frequently Asked Questions
        </h1>

        {/* Making a SafeSpeak Report Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('report')}
            className="w-full flex items-center justify-between py-4 px-6 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Making a SafeSpeak Report
            </h2>
            {openSection === 'report' ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </button>

          {openSection === 'report' && (
            <div className="mt-2 space-y-3">
              {/* What should be reported */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleQuestion('what-reported')}
                  className="w-full flex items-center justify-between py-3 px-6 bg-white hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-medium text-gray-800">
                    What should be reported to SafeSpeak?
                  </h3>
                  {openQuestion === 'what-reported' ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                
                {openQuestion === 'what-reported' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      You should report any incident involving abuse, harassment, or exploitation, including:
                    </p>
                    <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1">
                      <li>Physical or emotional abuse</li>
                      <li>Sexual harassment or exploitation</li>
                      <li>Online harassment or cyberbullying</li>
                      <li>Domestic violence</li>
                      <li>Child abuse or neglect</li>
                      <li>Any situation where someone's safety is at risk</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* How do I know if I should make a report */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleQuestion('how-know')}
                  className="w-full flex items-center justify-between py-3 px-6 bg-white hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-medium text-gray-800">
                    How do I know if I should make a SafeSpeak report?
                  </h3>
                  {openQuestion === 'how-know' ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                
                {openQuestion === 'how-know' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      You should make a SafeSpeak report if you are, or were at the time, under 18 and may have been the victim of abuse or exploitation. You should also make a report if you have information about the possible abuse and/or exploitation of a child or vulnerable person.
                    </p>
                  </div>
                )}
              </div>

              {/* Do I have to share my name */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleQuestion('share-name')}
                  className="w-full flex items-center justify-between py-3 px-6 bg-white hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-medium text-gray-800">
                    Do I have to share my name, phone number, email, etc.?
                  </h3>
                  {openQuestion === 'share-name' ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                
                {openQuestion === 'share-name' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      No, you can make an anonymous report. While providing contact information helps our team follow up if they need additional information, it is not required to submit a report. Your privacy and safety are important to us.
                    </p>
                  </div>
                )}
              </div>

              {/* Do I have to live in a specific country */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleQuestion('location')}
                  className="w-full flex items-center justify-between py-3 px-6 bg-white hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-medium text-gray-800">
                    Do I have to live in a specific country to make a report?
                  </h3>
                  {openQuestion === 'location' ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                
                {openQuestion === 'location' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      No, you can make a report from anywhere in the world. SafeSpeak accepts reports from any country regarding abuse, harassment, or exploitation. Reports are shared with appropriate local authorities and support services globally.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* What happens after I make a report Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('after-report')}
            className="w-full flex items-center justify-between py-4 px-6 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              What happens after I make a report?
            </h2>
            {openSection === 'after-report' ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </button>

          {openSection === 'after-report' && (
            <div className="mt-2 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                After you submit a report, it is reviewed by our team and forwarded to appropriate support services and authorities. You may receive a follow-up if you provided contact information. The process includes:
              </p>
              <ol className="list-decimal ml-6 mt-3 text-gray-700 space-y-2">
                <li>Initial review of the report for completeness</li>
                <li>Assessment of immediate safety concerns</li>
                <li>Referral to relevant local support services</li>
                <li>Coordination with authorities if needed</li>
                <li>Follow-up contact if additional information is required</li>
                <li>Connection to counseling or support resources</li>
              </ol>
            </div>
          )}
        </div>

        {/* Additional Resources Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Need immediate help?</h3>
          <div className="bg-rose-50 rounded-lg p-6">
            <p className="text-gray-700 mb-3">
              If you or someone you know is in immediate danger, please contact emergency services right away.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="tel:+251911123456" className="text-rose-600 font-medium hover:text-rose-700">
                📞 Emergency: +251 911 123 456
              </a>
              <span className="text-gray-400">|</span>
              <Link to="/report" className="text-sky-600 font-medium hover:text-sky-700">
                Make a Report →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;