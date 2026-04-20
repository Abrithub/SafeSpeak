import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand,
  FaShieldAlt, FaFileAlt, FaClock, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaPhone, FaEnvelope,
  FaComments, FaArrowRight, FaLock, FaUserSecret,
  FaExclamationTriangle,
} from 'react-icons/fa';

// ── Chapter markers for the video ────────────────────────────────────────────
const CHAPTERS = [
  { id: 0, time: 0,   label: 'Introduction',       icon: '👋', color: 'bg-sky-500' },
  { id: 1, time: 15,  label: 'Your Privacy',        icon: '🔒', color: 'bg-purple-500' },
  { id: 2, time: 35,  label: 'Fill the Form',       icon: '📋', color: 'bg-green-500' },
  { id: 3, time: 60,  label: 'Submit Securely',     icon: '🛡️', color: 'bg-orange-500' },
  { id: 4, time: 80,  label: 'Track Your Case',     icon: '🔍', color: 'bg-rose-500' },
];

// ── Interactive step guide ────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1, icon: '🔒', color: 'from-purple-500 to-purple-600',
    title: 'You Are Safe Here',
    desc: 'Your identity is protected. You choose what to share — most fields are optional. Reports are end-to-end encrypted.',
    detail: 'SafeSpeak uses military-grade encryption. No IP addresses are logged. You can submit completely anonymously.',
    preview: (
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 space-y-2">
        <div className="flex items-center gap-2 text-purple-700 text-sm font-semibold"><FaLock className="text-xs" /> Anonymous Mode</div>
        <div className="flex gap-2 flex-wrap">
          {['Name (optional)', 'Email (optional)', 'Phone (optional)'].map(f => (
            <span key={f} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">{f}</span>
          ))}
        </div>
        <p className="text-xs text-purple-500">✓ You control what you share</p>
      </div>
    ),
  },
  {
    id: 2, icon: '📋', color: 'from-sky-500 to-sky-600',
    title: 'Fill Out the Form',
    desc: 'Describe what happened in your own words. Select the type of incident and provide as much or as little detail as you feel comfortable with.',
    detail: 'The form has 4 sections: Reporter Info, Victim Info, Incident Details, and Evidence Upload. Each section takes about 1 minute.',
    preview: (
      <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 space-y-3">
        <div className="text-sky-700 text-sm font-semibold">Form Sections</div>
        {['1. Who are you reporting for?', '2. Describe the incident', '3. When & where did it happen?', '4. Upload evidence (optional)'].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-sky-600">
            <div className="w-4 h-4 rounded-full bg-sky-200 flex items-center justify-center text-[9px] font-bold text-sky-700">{i + 1}</div>
            {s}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3, icon: '🛡️', color: 'from-green-500 to-green-600',
    title: 'Submit Securely',
    desc: 'Hit submit and your report is instantly encrypted and sent to our response team. You\'ll receive a unique Case ID.',
    detail: 'Our AI system immediately analyzes urgency and routes your case to the right team. High-urgency cases are flagged within seconds.',
    preview: (
      <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-2">
        <div className="text-green-700 text-sm font-semibold">What happens next</div>
        <div className="space-y-1.5">
          {[
            { t: '0s', l: 'Report encrypted & submitted' },
            { t: '~5s', l: 'AI urgency analysis runs' },
            { t: '~1min', l: 'Case assigned to officer' },
            { t: 'Ongoing', l: 'You can track via Case ID' },
          ].map(({ t, l }) => (
            <div key={t} className="flex items-center gap-2 text-xs">
              <span className="text-green-500 font-bold w-14 shrink-0">{t}</span>
              <span className="text-green-700">{l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 4, icon: '🔍', color: 'from-orange-500 to-orange-600',
    title: 'Track Your Case',
    desc: 'Use your Case ID to check the status of your report anytime. No account needed — just your Case ID.',
    detail: 'Go to the Track Case page, enter your Case ID, and see real-time updates. Admins can also send you secure messages.',
    preview: (
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 space-y-2">
        <div className="text-orange-700 text-sm font-semibold">Case Statuses</div>
        {[
          { s: 'Pending', c: 'bg-yellow-100 text-yellow-700' },
          { s: 'Under Review', c: 'bg-blue-100 text-blue-700' },
          { s: 'In Progress', c: 'bg-purple-100 text-purple-700' },
          { s: 'Resolved', c: 'bg-green-100 text-green-700' },
        ].map(({ s, c }) => (
          <span key={s} className={`inline-block text-xs px-2 py-0.5 rounded-full mr-1 ${c}`}>{s}</span>
        ))}
      </div>
    ),
  },
];

const FAQS = [
  { q: 'How long does it take to complete a report?', a: 'Most reports take 3–5 minutes. Many fields are optional so you can go as fast as you need.' },
  { q: 'Do I have to share my contact information?', a: 'No. Name, email, and phone are all optional. You can report completely anonymously.' },
  { q: 'Is my report secure?', a: 'Yes. All reports are end-to-end encrypted. No IP addresses are stored. Your privacy is our priority.' },
  { q: 'What happens after I submit?', a: 'Our AI system analyzes urgency and routes your case to the right team. You\'ll get a Case ID to track progress.' },
  { q: 'Can I report on behalf of someone else?', a: 'Yes. The form lets you specify if you\'re reporting for yourself, a child, or another person.' },
  { q: 'What if I\'m in immediate danger?', a: 'Call emergency services (911) immediately. SafeSpeak is for reporting — not emergency response.' },
];

// ── Video player with chapter support ────────────────────────────────────────
function VideoPlayer() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying]     = useState(false);
  const [muted, setMuted]         = useState(true);
  const [progress, setProgress]   = useState(0);
  const [duration, setDuration]   = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCtrl, setShowCtrl]   = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const toggle = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const ct = videoRef.current.currentTime;
    const d  = videoRef.current.duration || 1;
    setCurrentTime(ct);
    setProgress((ct / d) * 100);
    const ch = [...CHAPTERS].reverse().find(c => ct >= c.time);
    if (ch) setActiveChapter(ch.id);
  };

  const seek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const jumpToChapter = (ch) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = ch.time;
    videoRef.current.play();
    setPlaying(true);
  };

  const fullscreen = () => containerRef.current?.requestFullscreen?.();

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
      {/* Chapter tabs */}
      <div className="bg-[#1a2340] flex overflow-x-auto scrollbar-hide">
        {CHAPTERS.map((ch) => (
          <button key={ch.id} onClick={() => jumpToChapter(ch)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition border-b-2 ${
              activeChapter === ch.id
                ? 'border-sky-400 text-sky-300 bg-white/5'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}>
            <span>{ch.icon}</span>{ch.label}
          </button>
        ))}
      </div>

      {/* Video */}
      <div ref={containerRef} className="relative bg-black group"
        onMouseEnter={() => setShowCtrl(true)} onMouseLeave={() => !playing && setShowCtrl(true)}>
        <video ref={videoRef} className="w-full aspect-video cursor-pointer"
          muted={muted} onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => setPlaying(false)} onClick={toggle}>
          <source src="/videos/video.mp4.mp4" type="video/mp4" />
          <source src="/videos/how-to-report.mp4" type="video/mp4" />
        </video>

        {/* Play overlay */}
        {!playing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer" onClick={toggle}>
            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform mb-3">
              <FaPlay className="text-sky-600 text-3xl ml-1" />
            </div>
            <p className="text-white text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full">
              {CHAPTERS[activeChapter]?.icon} {CHAPTERS[activeChapter]?.label}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity ${showCtrl ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress */}
          <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group/bar" onClick={seek}>
            {/* Chapter markers */}
            {CHAPTERS.slice(1).map(ch => (
              <div key={ch.id} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 -translate-x-1/2"
                style={{ left: `${(ch.time / (duration || 1)) * 100}%` }} title={ch.label} />
            ))}
            <div className="h-full bg-sky-400 rounded-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition" />
            </div>
          </div>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button onClick={toggle} className="hover:text-sky-400 transition">
                {playing ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={() => { if (videoRef.current) { videoRef.current.muted = !muted; setMuted(!muted); } }}
                className="hover:text-sky-400 transition">
                {muted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <span className="text-xs text-white/70">{fmt(currentTime)} / {fmt(duration)}</span>
            </div>
            <button onClick={fullscreen} className="hover:text-sky-400 transition"><FaExpand /></button>
          </div>
        </div>

        {/* Chapter badge */}
        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          {CHAPTERS[activeChapter]?.icon} {CHAPTERS[activeChapter]?.label}
        </div>
      </div>

      {/* Chapter list below video */}
      <div className="bg-gray-50 border-t border-gray-200 grid grid-cols-5 divide-x divide-gray-200">
        {CHAPTERS.map((ch) => (
          <button key={ch.id} onClick={() => jumpToChapter(ch)}
            className={`py-2 px-1 text-center transition hover:bg-gray-100 ${activeChapter === ch.id ? 'bg-sky-50' : ''}`}>
            <div className="text-lg mb-0.5">{ch.icon}</div>
            <div className={`text-[10px] font-medium ${activeChapter === ch.id ? 'text-sky-600' : 'text-gray-500'}`}>{ch.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Animated step guide ───────────────────────────────────────────────────────
function StepGuide() {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState(new Set([0]));

  const go = (i) => {
    setActive(i);
    setVisited(prev => new Set([...prev, i]));
  };

  const step = STEPS[active];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Step tabs */}
      <div className="flex border-b border-gray-200">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => go(i)}
            className={`flex-1 py-3 px-2 text-center transition relative ${
              active === i ? 'bg-gray-50' : 'hover:bg-gray-50'
            }`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm transition-all ${
              active === i
                ? `bg-gradient-to-br ${s.color} text-white shadow-md scale-110`
                : visited.has(i)
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {visited.has(i) && active !== i ? '✓' : s.icon}
            </div>
            <div className={`text-[10px] font-medium hidden sm:block ${active === i ? 'text-gray-800' : 'text-gray-400'}`}>
              Step {s.id}
            </div>
            {active === i && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl shadow-md shrink-0`}>
            {step.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Step {step.id}: {step.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
          </div>
        </div>

        {/* Detail box */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">{step.detail}</p>
        </div>

        {/* Interactive preview */}
        {step.preview}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button onClick={() => go(Math.max(0, active - 1))} disabled={active === 0}
            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 transition">
            ← Previous
          </button>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={`w-2 h-2 rounded-full transition-all ${active === i ? 'bg-sky-500 w-4' : 'bg-gray-300'}`} />
            ))}
          </div>
          {active < STEPS.length - 1 ? (
            <button onClick={() => go(active + 1)}
              className="text-sm text-sky-600 font-medium hover:text-sky-700 transition flex items-center gap-1">
              Next <FaArrowRight className="text-xs" />
            </button>
          ) : (
            <Link to="/report"
              className="text-sm bg-sky-500 text-white px-4 py-1.5 rounded-full font-medium hover:bg-sky-600 transition flex items-center gap-1">
              Start Report <FaArrowRight className="text-xs" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HowToReport() {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a2340] to-[#0f3460] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-4">
            <FaUserSecret className="text-sky-300" /> Anonymous & Secure
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">How to Make a Report</h1>
          <p className="text-white/70 text-base mb-6 max-w-xl mx-auto">
            Watch the interactive guide below, then start your report when you're ready. It takes less than 5 minutes.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/report"
              className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-full font-medium transition flex items-center gap-2">
              Start Report <FaArrowRight className="text-sm" />
            </Link>
            <Link to="/track"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-medium transition">
              Track Existing Case
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <FaLock className="text-purple-500" />, label: 'End-to-End Encrypted', sub: 'Military-grade security' },
            { icon: <FaUserSecret className="text-sky-500" />, label: '100% Anonymous', sub: 'No tracking, no logs' },
            { icon: <FaClock className="text-green-500" />, label: '< 5 Minutes', sub: 'Quick & easy process' },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2 text-lg">{icon}</div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Video player */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📹 Tutorial Video
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Click chapters to jump</span>
          </h2>
          <VideoPlayer />
        </div>

        {/* Interactive step guide */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🗺️ Interactive Step Guide
          </h2>
          <StepGuide />
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map((f, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition">
                  <span className="text-sm font-medium text-gray-800">{f.q}</span>
                  {openFaq === i ? <FaChevronUp className="text-gray-400 shrink-0 text-xs" /> : <FaChevronDown className="text-gray-400 shrink-0 text-xs" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-600 pt-3 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Need help */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Need Immediate Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: <FaPhone className="text-rose-500" />, bg: 'bg-rose-50', label: 'Call Us', sub: '24/7 Support', href: 'tel:+251911123456' },
              { icon: <FaEnvelope className="text-green-500" />, bg: 'bg-green-50', label: 'Email Us', sub: 'support@safespeak.org', href: 'mailto:support@safespeak.org' },
              { icon: <FaComments className="text-sky-500" />, bg: 'bg-sky-50', label: 'WhatsApp', sub: 'Chat with us', href: 'https://wa.me/251911123456' },
            ].map(({ icon, bg, label, sub, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-sky-200 hover:shadow-sm transition">
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>{icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Quick exit */}
        <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-600 text-sm">
            <FaExclamationTriangle />
            <span>In immediate danger? Call emergency services first.</span>
          </div>
          <button onClick={() => { window.open('', '_self'); window.close(); }}
            className="text-xs bg-rose-500 text-white px-4 py-1.5 rounded-full hover:bg-rose-600 transition font-medium">
            Quick Exit
          </button>
        </div>

      </div>
    </div>
  );
}
