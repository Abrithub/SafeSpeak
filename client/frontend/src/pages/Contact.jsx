import React, { useState } from 'react';
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
  FaShieldAlt,
  FaExclamationTriangle,
  FaChild,
  FaLink,
  FaExternalLinkAlt
} from 'react-icons/fa';

const Contact = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  const resources = [
    {
      id: 'ncmec',
      icon: <FaChild className="text-sky-500" />,
      title: 'National Center for Missing & Exploited Children',
      description: 'Report child exploitation or get help removing online imagery',
      content: (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-800 mb-2">Other Resources</h4>
            <p className="text-sm text-gray-600 mb-3">
              Whether you or someone you know is experiencing exploitation, or you want to better understand 
              ways the National Center for Missing & Exploited Children can help.
            </p>
            
            <div className="mt-3 p-3 bg-sky-50 rounded-lg">
              <p className="text-sm font-medium text-sky-800 mb-2">If you need help with removing imagery:</p>
              <a 
                href="https://missinks.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm"
              >
                <FaLink className="text-xs" />
                Visit Missinks.org – Is Your Exploit Content Out There?
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Get step-by-step instructions about how to contact an online platform directly to flag 
                your nude, partially nude, or sexually explicit image or video for removal.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-800 mb-2">Take It Down</h4>
            <p className="text-sm text-gray-600 mb-3">
              If you have nude, partially nude or sexually explicit images or videos taken before you were 18 
              that you believe may have been or will be shared online:
            </p>
            <a 
              href="https://takeitdown.ncmec.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition text-sm"
            >
              Visit TakeItDown.ncmec.org
              <FaExternalLinkAlt className="text-xs" />
            </a>
            <p className="text-xs text-gray-500 mt-2">
              Free service to help stop the online circulation of your photos or videos.
            </p>
          </div>
        </div>
      )
    },
    {
      id: '24hour',
      icon: <FaPhone className="text-rose-500" />,
      title: '24-Hour Call Center',
      description: 'Report information about a missing or exploited child',
      content: (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600 mb-3">
              To report information about a missing or exploited child call our 24-Hour Call Center:
            </p>
            <a 
              href="tel:1-800-THE-LOST" 
              className="text-2xl font-bold text-sky-600 hover:text-sky-700 block mb-2"
            >
              1-800-THE-LOST
            </a>
            <p className="text-xs text-gray-500">(1-800-843-5678)</p>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                General inquiries to National Center for Missing and Exploited Children.
              </p>
              <a 
                href="https://missingskills.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-700 text-sm inline-flex items-center gap-1 mt-2"
              >
                Visit missingskills.org
                <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">If you are unsure or someone is in immediate danger:</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please call <span className="font-bold">911</span> or your local police immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'support',
      icon: <FaEnvelope className="text-green-500" />,
      title: 'Email Support',
      description: 'General inquiries and support',
      details: [
        { label: 'General Inquiries', value: 'info@safespeak.org' },
        { label: 'Support', value: 'support@safespeak.org' },
        { label: 'Emergency Reports', value: 'emergency@safespeak.org' }
      ]
    },
    {
      id: 'messaging',
      icon: <FaWhatsapp className="text-green-600" />,
      title: 'Messaging Apps',
      description: 'Chat with us on your favorite app',
      details: [
        { label: 'WhatsApp', value: '+251 911 123 456', link: 'https://wa.me/251911123456' },
        { label: 'Telegram', value: '@safespeak_support', link: 'https://t.me/safespeak_support' },
        { label: 'Signal', value: '+251 911 123 456' }
      ]
    },
    {
      id: 'location',
      icon: <FaMapMarkerAlt className="text-red-500" />,
      title: 'Visit Us',
      description: 'Our physical locations',
      details: [
        { label: 'Head Office', value: 'Addis Ababa, Bole Road, Ethiopia', hours: 'Mon-Fri 9AM-5PM' },
        { label: 'Regional Office', value: 'Bahir Dar, Piazza, Ethiopia', hours: 'Mon-Fri 9AM-5PM' }
      ]
    }
  ];

  const socialMedia = [
    { icon: <FaTwitter />, name: 'Twitter', link: '#', color: 'text-blue-400' },
    { icon: <FaFacebook />, name: 'Facebook', link: '#', color: 'text-blue-600' },
    { icon: <FaTelegram />, name: 'Telegram', link: '#', color: 'text-blue-500' },
    { icon: <FaWhatsapp />, name: 'WhatsApp', link: '#', color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            CyberTipline & Support
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Report missing or exploited children, get help removing online imagery, or contact our support team.
          </p>
        </div>

        {/* Emergency Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-rose-500 text-xl" />
              <div>
                <span className="font-semibold text-rose-700">Immediate Danger?</span>
                <p className="text-sm text-gray-600">Call 911 or your local police immediately</p>
              </div>
            </div>
            <a 
              href="tel:911"
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition flex items-center gap-2"
            >
              <FaPhone className="text-sm" />
              Call 911
            </a>
          </div>
        </div>

        {/* Main Contact Sections - Dropdown Style */}
        <div className="space-y-3 mb-8">
          {resources.map((resource) => (
            <div key={resource.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Section Header - Clickable */}
              <button
                onClick={() => toggleSection(resource.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${resource.id === 'ncmec' ? 'bg-sky-100' : 
                      resource.id === '24hour' ? 'bg-rose-100' : 
                      resource.id === 'support' ? 'bg-green-100' :
                      resource.id === 'messaging' ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    {resource.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{resource.title}</h3>
                    <p className="text-sm text-gray-500">{resource.description}</p>
                  </div>
                </div>
                {openSection === resource.id ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>

              {/* Expanded Content */}
              {openSection === resource.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {resource.content ? (
                    resource.content
                  ) : (
                    <div className="space-y-3">
                      {resource.details?.map((detail, index) => (
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
                              ) : (
                                <p className="text-gray-700">{detail.value}</p>
                              )}
                              {detail.hours && (
                                <p className="text-xs text-gray-400 mt-1">{detail.hours}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Social Media */}
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

        {/* Activate Windows Notice */}
        <div className="bg-gray-100 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Activate Windows
            <span className="text-gray-400">Go to Settings to activate Windows.</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search the web and Windows"
              className="w-full px-3 py-2 text-sm border-none focus:outline-none"
            />
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">
              Search
            </button>
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