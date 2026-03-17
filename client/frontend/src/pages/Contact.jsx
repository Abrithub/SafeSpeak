import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaChevronDown, 
  FaChevronUp,
  FaWhatsapp,
  FaTelegram,
  FaTwitter,
  FaFacebook,
  FaGlobe,
  FaShieldAlt
} from 'react-icons/fa';

const Contact = () => {
  const [openSection, setOpenSection] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const contactMethods = [
    {
      id: 'phone',
      icon: <FaPhone className="text-sky-500" />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      details: [
        { label: 'Emergency (24/7)', value: '+251 911 123 456', type: 'emergency' },
        { label: 'General Inquiries', value: '+251 911 789 012', type: 'general' },
        { label: 'Reporting Hotline', value: '+251 911 345 678', type: 'hotline' }
      ],
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'email',
      icon: <FaEnvelope className="text-green-500" />,
      title: 'Email Support',
      description: 'Send us a message anytime',
      details: [
        { label: 'Support', value: 'support@safespeak.org', type: 'support' },
        { label: 'Emergency Reports', value: 'emergency@safespeak.org', type: 'emergency' },
        { label: 'Partnerships', value: 'partners@safespeak.org', type: 'partners' }
      ],
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      id: 'messaging',
      icon: <FaWhatsapp className="text-green-600" />,
      title: 'Messaging Apps',
      description: 'Chat with us on your favorite app',
      details: [
        { label: 'WhatsApp', value: '+251 911 123 456', link: 'https://wa.me/251911123456' },
        { label: 'Telegram', value: '@safespeak_support', link: 'https://t.me/safespeak_support' },
        { label: 'Signal', value: '+251 911 123 456', link: '#' }
      ],
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      id: 'location',
      icon: <FaMapMarkerAlt className="text-red-500" />,
      title: 'Visit Us',
      description: 'Our physical locations',
      details: [
        { label: 'Head Office', value: 'Addis Ababa, Bole Road, Ethiopia', hours: 'Mon-Fri 9AM-5PM' },
        { label: 'Regional Office', value: 'Bahir Dar, Piazza, Ethiopia', hours: 'Mon-Fri 9AM-5PM' }
      ],
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100'
    }
  ];

  const socialMedia = [
    { icon: <FaTwitter />, name: 'Twitter', link: 'https://twitter.com/safespeak', color: 'text-blue-400' },
    { icon: <FaFacebook />, name: 'Facebook', link: 'https://facebook.com/safespeak', color: 'text-blue-600' },
    { icon: <FaTelegram />, name: 'Telegram', link: 'https://t.me/safespeak', color: 'text-blue-500' },
    { icon: <FaWhatsapp />, name: 'WhatsApp', link: 'https://wa.me/251911123456', color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Contact Us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're here to help 24/7. Choose how you'd like to reach us.
          </p>
        </div>

        {/* Emergency Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-rose-500 text-xl" />
              <div>
                <span className="font-semibold text-rose-700">Emergency?</span>
                <p className="text-sm text-gray-600">24/7 Immediate assistance available</p>
              </div>
            </div>
            <a 
              href="tel:+251911123456"
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition flex items-center gap-2"
            >
              <FaPhone className="text-sm" />
              Call Now
            </a>
          </div>
        </div>

        {/* Main Contact Sections - Dropdown Style */}
        <div className="space-y-3 mb-8">
          {contactMethods.map((method) => (
            <div key={method.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Section Header - Clickable */}
              <button
                onClick={() => toggleSection(method.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${method.iconBg} flex items-center justify-center`}>
                    {method.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{method.title}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
                {openSection === method.id ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>

              {/* Expanded Content */}
              {openSection === method.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-3">
                    {method.details.map((detail, index) => (
                      <div 
                        key={index}
                        className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-sm transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">{detail.label}</p>
                            {detail.link ? (
                              <a 
                                href={detail.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 font-medium hover:underline"
                              >
                                {detail.value}
                              </a>
                            ) : detail.type === 'emergency' ? (
                              <a href={`tel:${detail.value}`} className="text-rose-600 font-medium hover:underline">
                                {detail.value}
                              </a>
                            ) : detail.type === 'hotline' ? (
                              <a href={`tel:${detail.value}`} className="text-sky-600 font-medium hover:underline">
                                {detail.value}
                              </a>
                            ) : (
                              <p className="text-gray-700">{detail.value}</p>
                            )}
                            {detail.hours && (
                              <p className="text-xs text-gray-400 mt-1">{detail.hours}</p>
                            )}
                          </div>
                          {detail.type === 'emergency' && (
                            <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full">
                              24/7
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-2">
                      {method.id === 'phone' && (
                        <>
                          <button 
                            onClick={() => toggleCard('callback')}
                            className="flex-1 text-sm bg-sky-500 text-white py-2 rounded hover:bg-sky-600 transition"
                          >
                            Request Callback
                          </button>
                          {expandedCards['callback'] && (
                            <div className="mt-2 p-3 bg-sky-50 rounded-lg">
                              <input 
                                type="text" 
                                placeholder="Your phone number" 
                                className="w-full px-3 py-2 border rounded mb-2 text-sm"
                              />
                              <button className="w-full bg-sky-500 text-white py-2 rounded text-sm">
                                Submit
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      {method.id === 'email' && (
                        <button className="flex-1 text-sm bg-sky-500 text-white py-2 rounded hover:bg-sky-600 transition">
                          Send Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Social Media - Interactive Cards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Connect With Us</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {socialMedia.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border border-gray-100 rounded-lg hover:border-gray-300 hover:shadow-sm transition group"
              >
                <div className={`text-2xl ${social.color} mb-2 group-hover:scale-110 transition`}>
                  {social.icon}
                </div>
                <span className="text-xs text-gray-600">{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Office Hours Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaClock className="text-sky-500 text-xl" />
            <h3 className="font-semibold text-gray-800">Office Hours</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Monday - Friday</p>
              <p className="font-medium">9:00 AM - 5:00 PM</p>
            </div>
            <div>
              <p className="text-gray-600">Emergency</p>
              <p className="font-medium text-rose-600">24/7 Available</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <FaGlobe className="inline-block mr-1" />
          All communications are encrypted and secure
        </div>
      </div>
    </div>
  );
};

export default Contact;