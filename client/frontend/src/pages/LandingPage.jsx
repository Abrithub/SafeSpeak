import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt, FaComments, FaBolt, FaPhoneAlt,
  FaCheckCircle, FaHandshake, FaCogs,
  FaChevronDown, FaChevronUp, FaPlay, FaPause,
  FaVolumeUp, FaVolumeMute, FaExpand,
  FaPhone, FaEnvelope, FaFileAlt, FaClock,
} from "react-icons/fa";

/* ── FAQ DATA ── */
const faqs = [
  { q: "What should be reported to SafeSpeak?", a: "Any incident involving abuse, harassment, or exploitation — physical, emotional, sexual, online, domestic violence, child abuse or neglect." },
  { q: "Do I have to share my name or contact info?", a: "No. You can submit completely anonymously. Contact info is optional and only used for follow-up if you consent." },
  { q: "How long does it take to complete a report?", a: "Just a few minutes. Most fields are optional so you provide only what you're comfortable sharing." },
  { q: "Is my report secure?", a: "Yes. All reports are encrypted end-to-end and handled with strict confidentiality." },
  { q: "What happens after I submit?", a: "Our team reviews the report, assesses safety concerns, and refers to relevant local support services and authorities." },
  { q: "Do I have to live in a specific country?", a: "No. SafeSpeak accepts reports from anywhere in the world." },
];

export default function LandingPage() {
  const [showWarning, setShowWarning] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowWarning(true), 800);
    return () => clearTimeout(t);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoPlaying) { videoRef.current.pause(); setVideoPlaying(false); }
    else { videoRef.current.play(); setVideoPlaying(true); }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section id="home" className="relative overflow-hidden pt-16">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-200 rounded-3xl rotate-[-10deg] -z-10" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-100 rounded-3xl rotate-[12deg] -z-10" />

        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Interactive, Secure and Speak Freely
              </h1>
              <p className="text-gray-600 mb-6">
                SafeSpeak allows individuals to safely report abuse and harmful incidents while
                maintaining privacy and security. Our platform ensures responsible reporting
                and faster support when needed.
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <Link to="/report" className="bg-sky-400 text-white px-6 py-3 rounded-lg hover:bg-sky-500 transition">
                  Report Incident
                </Link>
                <button onClick={() => scrollTo("how-to-report")} className="text-sky-500 font-medium hover:underline">
                  See how to report?
                </button>
              </div>
              {/* Scroll hint */}
              <div className="mt-10 flex items-center gap-2 text-gray-400 text-sm animate-bounce">
                <FaChevronDown /> Scroll to explore
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="w-full max-w-md h-72 rounded-xl overflow-hidden shadow-md bg-slate-200 mx-auto">
                <img src="/hero.png" alt="SafeSpeak" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Urgent call bar */}
        <div className="bg-white shadow-lg py-6">
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                <FaPhoneAlt className="text-sky-500" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Call Now For Urgent Incident</p>
                <p className="text-sky-500 font-semibold">+251 911 123 456</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {[{ icon: <FaShieldAlt />, label: "Secure" }, { icon: <FaComments />, label: "Interactive" }, { icon: <FaBolt />, label: "Fast Response" }].map((i) => (
                <div key={i.label} className="flex flex-col items-center text-sky-400">
                  <span className="text-xl mb-0.5">{i.icon}</span>
                  <span className="text-xs text-gray-600">{i.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — ABOUT / PARTNERS
      ══════════════════════════════════════════ */}
      <section id="about" className="bg-gradient-to-br from-slate-50 to-sky-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-slate-800 mb-2">OUR PARTNERS</h2>
            <p className="text-xl text-sky-600 font-semibold">Together With Us</p>
            <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
              <img src="/association.png" alt="Association" className="h-32 object-contain rounded-lg shadow-md" onError={(e) => e.target.style.display = "none"} />
              <img src="/child.png" alt="Child org" className="h-32 object-contain rounded-lg shadow-md" onError={(e) => e.target.style.display = "none"} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6">
                What makes us a <span className="text-sky-500">Trusted Partner?</span>
              </h3>
              <div className="space-y-3">
                {["We are committed to quality.", "We believe in transparency.", "Scalable solutions for every need.", "We provide end-to-end support."].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <FaCheckCircle className="text-sky-500 text-xl mt-0.5 shrink-0" />
                    <p className="text-slate-700">{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <FaShieldAlt />, title: "Quality First", sub: "Committed to excellence" },
                { icon: <FaHandshake />, title: "Transparency", sub: "Clear communication" },
                { icon: <FaCogs />, title: "Scalable", sub: "Grow with us" },
                { icon: <FaCheckCircle />, title: "End-to-End", sub: "Complete solutions" },
              ].map((c) => (
                <div key={c.title} className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                  <div className="text-sky-500 text-2xl mb-2">{c.icon}</div>
                  <p className="font-semibold text-slate-800">{c.title}</p>
                  <p className="text-sm text-slate-500">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 bg-sky-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-3">EMPOWERING YOUR GROWTH WITH RELIABLE SOLUTIONS</h3>
              <button onClick={() => scrollTo("contact")} className="bg-white text-sky-600 px-6 py-2 rounded-full font-semibold hover:bg-sky-50 transition">
                Contact Us →
              </button>
            </div>
            <div className="text-right">
              <p className="font-medium">abbetterment@gmail.com</p>
              <p className="text-2xl font-bold">022-46134613</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — HOW TO REPORT
      ══════════════════════════════════════════ */}
      <section id="how-to-report" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">How to Make a Report</h2>
            <p className="text-gray-500">Secure, anonymous, and takes just a few minutes.</p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <FaFileAlt />, title: "Fill the Form", desc: "Complete the secure form. Most fields are optional." },
              { icon: <FaCheckCircle />, title: "Review", desc: "Double-check your information before submitting." },
              { icon: <FaShieldAlt />, title: "Submit Securely", desc: "Your report is encrypted and sent to our team." },
              { icon: <FaClock />, title: "Get Follow-up", desc: "We'll reach out if you provided contact info." },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 text-lg mx-auto mb-3">{s.icon}</div>
                <p className="font-semibold text-gray-800 text-sm mb-1">{s.title}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Video */}
          <div className="rounded-xl overflow-hidden bg-black shadow-lg mb-8 relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}>
            <video ref={videoRef} className="w-full aspect-video cursor-pointer"
              onTimeUpdate={() => { if (videoRef.current) setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100); }}
              onLoadedMetadata={() => { if (videoRef.current) setVideoDuration(videoRef.current.duration); }}
              onEnded={() => setVideoPlaying(false)}
              onClick={togglePlay} muted={isMuted}>
              <source src="/videos/video.mp4.mp4" type="video/mp4" />
            </video>
            {!videoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <FaPlay className="text-sky-600 text-2xl ml-1" />
                </div>
              </div>
            )}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`}>
              <div className="w-full h-1 bg-gray-600 rounded-full mb-2 cursor-pointer" onClick={(e) => { if (videoRef.current) videoRef.current.currentTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * videoRef.current.duration; }}>
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${videoProgress}%` }} />
              </div>
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay}>{videoPlaying ? <FaPause /> : <FaPlay />}</button>
                  <button onClick={() => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } }}>{isMuted ? <FaVolumeMute /> : <FaVolumeUp />}</button>
                </div>
                <button onClick={() => videoRef.current?.requestFullscreen?.()}><FaExpand /></button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/report" className="bg-sky-500 text-white px-8 py-3 rounded-lg hover:bg-sky-600 transition font-medium inline-block">
              Start Your Report
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — FAQ
      ══════════════════════════════════════════ */}
      <section id="faq" className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know before making a report.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition">
                  <span className="font-medium text-gray-800">{f.q}</span>
                  {openFaq === i ? <FaChevronUp className="text-gray-400 shrink-0" /> : <FaChevronDown className="text-gray-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — CONTACT / CALL US
      ══════════════════════════════════════════ */}
      <section id="contact" className="bg-[#fbf3e9] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h2>
            <p className="text-gray-500">We're available 24/7. Reach out any way you're comfortable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <FaPhone className="text-rose-500" />, bg: "bg-rose-100", title: "Call Us", sub: "+251 911 123 456", href: "tel:+251911123456" },
              { icon: <FaEnvelope className="text-green-500" />, bg: "bg-green-100", title: "Email Us", sub: "support@safespeak.org", href: "mailto:support@safespeak.org" },
              { icon: <FaComments className="text-sky-500" />, bg: "bg-sky-100", title: "WhatsApp", sub: "Chat with us", href: "https://wa.me/251911123456" },
            ].map((c) => (
              <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center text-xl`}>{c.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800">{c.title}</p>
                  <p className="text-sm text-gray-500">{c.sub}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Call us banner */}
          <div className="grid grid-cols-1 md:grid-cols-5 rounded-2xl overflow-hidden shadow-md">
            <div className="md:col-span-2 h-56 bg-[#f4ddc6] overflow-hidden">
              <img src="/callus.png" alt="Call us" className="w-full h-full object-cover object-top" />
            </div>
            <div className="md:col-span-3 bg-white p-8 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">If you prefer to speak to someone directly,</h3>
                <p className="text-slate-600 text-sm mt-1">contact our Call Center for immediate help and guidance.</p>
                <p className="text-rose-600 font-semibold text-sm mt-3">Available 24 hours a day, 7 days a week.</p>
                <a href="tel:+251911123456" className="mt-1 inline-block text-slate-800 underline font-medium text-sm">+251 911 123 456</a>
              </div>
              <button onClick={() => { window.open("", "_self"); window.close(); }}
                className="shrink-0 bg-rose-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-rose-400 transition text-sm">
                Quick Exit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Legal warning popup */}
      <div className={`fixed bottom-6 right-4 max-w-sm w-80 bg-white shadow-xl border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-300 z-50 ${showWarning ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
        <div className="mt-1 h-8 w-1.5 rounded-full bg-red-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-600">የሕግ ማስጠንቀቂያ</p>
          <div className="text-xs text-gray-700 mt-1 space-y-1">
            <p>False or misleading abuse reports may lead to legal consequences.</p>
            <p>የሐሰት ወይም የተሳሳተ የጥቃት መግለጫ በሕግ መወሰን ይችላል።</p>
          </div>
        </div>
        <button onClick={() => setShowWarning(false)} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">✕</button>
      </div>
    </div>
  );
}
