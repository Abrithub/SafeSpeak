import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShieldAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock,
  FaSignOutAlt, FaFileAlt, FaLock, FaPaperPlane,
  FaPhone, FaExclamationTriangle, FaChevronRight,
} from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { getMyCases, replyMessage } from "../services/api";
import ChatBot, { openChatBot } from "../components/ChatBot";

// ── Reply box ─────────────────────────────────────────────────────────────────
function ReplyBox({ caseId, onSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await replyMessage(caseId, text.trim());
    setText(""); onSent(); setSending(false);
  };
  return (
    <div className="flex gap-2 mt-3">
      <input value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && send()}
        className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        placeholder="Reply to support team..." />
      <button onClick={send} disabled={sending || !text.trim()}
        className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50">
        <FaPaperPlane className="text-xs" />
      </button>
    </div>
  );
}

// ── "What happens next" guide ─────────────────────────────────────────────────
const NEXT_STEPS = {
  "Pending":        { icon: "⏳", color: "bg-yellow-50 border-yellow-200 text-yellow-800", text: "Your report has been received and is waiting to be reviewed by our support team. This usually takes 24–48 hours." },
  "Under Review":   { icon: "🔍", color: "bg-blue-50 border-blue-200 text-blue-800",   text: "A case officer is currently reviewing your report. They may send you a message if they need more information." },
  "In Progress":    { icon: "⚙️", color: "bg-purple-50 border-purple-200 text-purple-800", text: "Your case is actively being handled. Check the referral section below for details on where your case has been sent." },
  "Resolved":       { icon: "✅", color: "bg-green-50 border-green-200 text-green-800", text: "Your case has been resolved. If you have further concerns, you can submit a new report at any time." },
  "Rejected":       { icon: "❌", color: "bg-gray-50 border-gray-200 text-gray-600",   text: "Your case could not be processed. This may be due to insufficient information. You can submit a new report with more details." },
  "Archived":       { icon: "📦", color: "bg-slate-50 border-slate-200 text-slate-600", text: "Your case has been archived for record keeping." },
};

// ── Emergency contacts ────────────────────────────────────────────────────────
const EMERGENCY = [
  { label: "Emergency Line",    number: "+251965485715", color: "bg-red-500" },
  { label: "Support Line",      number: "+251987240570", color: "bg-orange-500" },
  { label: "Child Protection",  number: "+251909853958", color: "bg-purple-500" },
  { label: "WhatsApp Support",  number: "+251960255733", color: "bg-teal-500" },
];

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700", "Under Review": "bg-blue-100 text-blue-700",
  "In Progress": "bg-purple-100 text-purple-700", Resolved: "bg-green-100 text-green-700",
  Rejected: "bg-gray-100 text-gray-500", Archived: "bg-slate-100 text-slate-500",
};
const urgencyDot   = { High: "bg-red-500", Medium: "bg-yellow-400", Low: "bg-blue-400" };
const urgencyLabel = { High: "text-red-600 bg-red-50", Medium: "text-yellow-600 bg-yellow-50", Low: "text-blue-600 bg-blue-50" };
const STATUS_FLOW  = ["Pending", "Under Review", "In Progress", "Resolved"];
const apptStatusColor = {
  Scheduled: "bg-blue-100 text-blue-700", Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",   Completed: "bg-gray-100 text-gray-500",
};

export default function MyCases() {
  const navigate = useNavigate();
  const [cases, setCases]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [selected, setSelected] = useState(null);

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  const load = () => getMyCases().then(data => {
    if (Array.isArray(data)) setCases(data);
    else setError(data.message || "Failed to load cases.");
    setLoading(false);
  }).catch(() => { setError("Server unreachable."); setLoading(false); });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || user.role === "admin") { navigate("/login"); return; }
    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const quickExit = () => { window.open("", "_self"); window.close(); };

  const selectedCase = cases.find(c => c.caseId === selected);
  const stepIndex    = selectedCase ? STATUS_FLOW.indexOf(selectedCase.status) : -1;

  return (
    <>
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-[#0f766e] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-xl" />
          <div>
            <p className="font-bold text-sm">SafeSpeak — My Cases</p>
            <p className="text-xs text-white/70">Logged in as {user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/report" className="text-xs bg-white text-teal-700 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-50 transition">
            + New Report
          </Link>
          <button
            onClick={openChatBot}
            className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition flex items-center gap-1.5"
          >
            <FiMessageCircle size={13} /> AI Mentor
          </button>
          <button onClick={quickExit}
            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition flex items-center gap-1">
            <FaExclamationTriangle className="text-xs" /> Quick Exit
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Emergency contacts bar — always visible */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5 border border-red-100">
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <FaPhone className="text-red-500 text-[10px]" /> Emergency Contacts — Available 24/7
          </p>
          <div className="flex flex-wrap gap-2">
            {EMERGENCY.map(e => (
              <a key={e.label} href={`tel:${e.number.replace(/\s/g,"")}`}
                className={`${e.color} text-white text-xs px-3 py-1.5 rounded-full font-medium hover:opacity-90 transition`}>
                {e.label}: {e.number}
              </a>
            ))}
          </div>
        </div>

        {loading && <p className="text-center text-gray-400 py-20">Loading your cases...</p>}
        {error   && <p className="text-center text-red-500 py-10">{error}</p>}

        {!loading && !error && cases.length === 0 && (
          <div className="text-center py-20">
            <FaFileAlt className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No cases submitted yet.</p>
            <p className="text-gray-400 text-sm mt-1">When you submit a report, it will appear here.</p>
            <Link to="/report" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-teal-700 transition">
              Submit a Report
            </Link>
          </div>
        )}

        {!loading && cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ── Case list ── */}
            <div className="md:col-span-1 space-y-3">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">Your Reports ({cases.length})</h2>
              {cases.map(c => (
                <button key={c.caseId} onClick={() => setSelected(c.caseId)}
                  className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border-l-4 transition hover:shadow-md ${
                    selected === c.caseId ? "border-teal-500" : "border-transparent"
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-gray-700">{c.caseId}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{c.classification}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  {(c.messages||[]).filter(m => m.from === "admin").length > 0 && (
                    <p className="text-[10px] text-green-600 mt-1 font-medium">💬 New message from support</p>
                  )}
                  {(c.appointments||[]).filter(a => a.status === "Scheduled").length > 0 && (
                    <p className="text-[10px] text-blue-600 mt-1 font-medium">📅 Appointment scheduled</p>
                  )}
                  {c.referral?.type && (
                    <p className="text-[10px] mt-1 font-medium text-purple-600">
                      {c.referral.type === "police" ? "🚔 Referred to Police" :
                       c.referral.type === "court"  ? "⚖️ Court date scheduled" : "📋 Info requested"}
                    </p>
                  )}
                </button>
              ))}

              {/* Submit another */}
              <Link to="/report"
                className="flex items-center justify-between w-full bg-teal-50 border border-teal-200 rounded-xl p-4 hover:bg-teal-100 transition text-teal-700 text-sm font-medium">
                + Submit Another Report <FaChevronRight className="text-xs" />
              </Link>
            </div>

            {/* ── Case detail ── */}
            <div className="md:col-span-2">
              {!selectedCase ? (
                <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm">
                  <FaShieldAlt className="text-4xl mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">Select a case from the left to view details</p>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Status + progress */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400 font-mono">{selectedCase.caseId}</p>
                        <h3 className="text-lg font-bold text-gray-800">{selectedCase.classification}</h3>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[selectedCase.status]}`}>
                        {selectedCase.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Case Progress</p>
                    <div className="flex items-center mb-2">
                      {STATUS_FLOW.map((s, i) => (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                              i <= stepIndex ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-gray-300 text-gray-400"
                            }`}>{i < stepIndex ? "✓" : i + 1}</div>
                            <span className="text-[9px] text-gray-500 mt-1 whitespace-nowrap">{s}</span>
                          </div>
                          {i < STATUS_FLOW.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 ${i < stepIndex ? "bg-teal-600" : "bg-gray-200"}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* What happens next */}
                  {NEXT_STEPS[selectedCase.status] && (
                    <div className={`rounded-xl p-4 border ${NEXT_STEPS[selectedCase.status].color}`}>
                      <p className="text-sm font-semibold mb-1">
                        {NEXT_STEPS[selectedCase.status].icon} What happens next?
                      </p>
                      <p className="text-xs leading-relaxed">{NEXT_STEPS[selectedCase.status].text}</p>
                    </div>
                  )}

                  {/* What you reported */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">📋 What You Reported</h4>
                    {(selectedCase.abuseTypes||[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {selectedCase.abuseTypes.map(t => (
                          <span key={t} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">{t}</span>
                        ))}
                      </div>
                    )}
                    {selectedCase.description && (
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">{selectedCase.description}</p>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                      {selectedCase.whenDidItHappen && <div><span className="text-gray-400">When:</span> {selectedCase.whenDidItHappen}</div>}
                      {selectedCase.isVictimSafe    && <div><span className="text-gray-400">Victim safe:</span> {selectedCase.isVictimSafe}</div>}
                      {selectedCase.locationTypeOfIncident && <div><span className="text-gray-400">Location type:</span> {selectedCase.locationTypeOfIncident}</div>}
                      <div><span className="text-gray-400">Submitted:</span> {new Date(selectedCase.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Case timeline */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">🕐 Case Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-700">Report Submitted</p>
                          <p className="text-[10px] text-gray-400">{new Date(selectedCase.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {(selectedCase.messages||[]).filter(m => m.from === "admin").map((m, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700">Message from Support</p>
                            <p className="text-[10px] text-gray-500 truncate max-w-xs">{m.text}</p>
                            <p className="text-[10px] text-gray-400">{new Date(m.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      {(selectedCase.appointments||[]).map((a, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700">Appointment Scheduled</p>
                            <p className="text-[10px] text-gray-500">{a.date} at {a.time} — {a.location}</p>
                            <p className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      {selectedCase.referral?.type && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700">
                              {selectedCase.referral.type === "police" ? "Referred to Police" :
                               selectedCase.referral.type === "court"  ? "Court Date Scheduled" : "Information Requested"}
                            </p>
                            <p className="text-[10px] text-gray-400">{selectedCase.referral.referredAt ? new Date(selectedCase.referral.referredAt).toLocaleString() : ""}</p>
                          </div>
                        </div>
                      )}
                      {["Resolved","Rejected","Archived"].includes(selectedCase.status) && (
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${selectedCase.status === "Resolved" ? "bg-green-500" : "bg-gray-400"}`} />
                          <div>
                            <p className="text-xs font-semibold text-gray-700">Case {selectedCase.status}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secure messages */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaLock className="text-green-600 text-xs" /> Secure Messages
                    </h4>
                    {(selectedCase.messages||[]).length === 0 ? (
                      <p className="text-xs text-gray-400">No messages yet. The support team will contact you here if needed.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto mb-1">
                        {selectedCase.messages.map((m, i) => (
                          <div key={i} className={`rounded-lg p-3 text-xs max-w-[85%] ${
                            m.from === "admin" ? "bg-teal-50 border border-teal-100" : "bg-[#1a2340] text-white ml-auto"
                          }`}>
                            <p className={m.from === "admin" ? "text-gray-700 whitespace-pre-line" : "text-white"}>{m.text}</p>
                            <p className={`text-[10px] mt-1 ${m.from === "admin" ? "text-gray-400" : "text-white/60"}`}>
                              {m.from === "admin" ? "Support Team" : "You"} · {new Date(m.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <ReplyBox caseId={selectedCase.caseId} onSent={load} />
                  </div>

                  {/* Referral info */}
                  {selectedCase.referral?.type && (
                    <div className={`rounded-xl p-5 border-l-4 ${
                      selectedCase.referral.type === "police" ? "bg-blue-50 border-blue-500" :
                      selectedCase.referral.type === "court"  ? "bg-yellow-50 border-yellow-500" :
                      "bg-orange-50 border-orange-500"
                    }`}>
                      <h4 className="text-sm font-bold text-gray-800 mb-3">
                        {selectedCase.referral.type === "police" ? "🚔 Your Case Has Been Referred to Police" :
                         selectedCase.referral.type === "court"  ? "⚖️ Court Date Scheduled" :
                         "📋 Additional Information Requested"}
                      </h4>
                      <div className="space-y-1 text-xs text-gray-700">
                        {selectedCase.referral.type === "police" && <>
                          {selectedCase.referral.stationName    && <p><strong>Station:</strong> {selectedCase.referral.stationName}</p>}
                          {selectedCase.referral.stationAddress && <p><strong>Address:</strong> {selectedCase.referral.stationAddress}</p>}
                          {selectedCase.referral.officerName    && <p><strong>Officer:</strong> {selectedCase.referral.officerName}</p>}
                          {selectedCase.referral.officerPhone   && <p><strong>Phone:</strong> <a href={`tel:${selectedCase.referral.officerPhone}`} className="text-blue-600 underline">{selectedCase.referral.officerPhone}</a></p>}
                          <p className="text-blue-700 font-semibold mt-2">Please visit the station and mention your Case ID: <strong>{selectedCase.caseId}</strong></p>
                        </>}
                        {selectedCase.referral.type === "court" && <>
                          {selectedCase.referral.courtName && <p><strong>Court:</strong> {selectedCase.referral.courtName}</p>}
                          {selectedCase.referral.courtDate && <p><strong>Date:</strong> {selectedCase.referral.courtDate}</p>}
                          {selectedCase.referral.courtTime && <p><strong>Time:</strong> {selectedCase.referral.courtTime}</p>}
                          {selectedCase.referral.courtRoom && <p><strong>Room:</strong> {selectedCase.referral.courtRoom}</p>}
                          {selectedCase.referral.judge     && <p><strong>Judge:</strong> {selectedCase.referral.judge}</p>}
                          <p className="text-red-600 font-semibold mt-2">⚠️ Arrive 30 minutes early. Bring a valid ID.</p>
                        </>}
                        {selectedCase.referral.type === "info_request" && <>
                          {selectedCase.referral.infoRequest  && <p><strong>Required:</strong> {selectedCase.referral.infoRequest}</p>}
                          {selectedCase.referral.infoDeadline && <p><strong>Deadline:</strong> {selectedCase.referral.infoDeadline}</p>}
                          <p className="text-orange-700 font-medium mt-2">Please reply to the support team using the message box above.</p>
                        </>}
                        {selectedCase.referral.referralNote && (
                          <div className="bg-white rounded-lg p-2 mt-2 border">
                            <p><strong>Note from Support:</strong> {selectedCase.referral.referralNote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Appointments */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-500" /> Appointments
                    </h4>
                    {(selectedCase.appointments||[]).length === 0 ? (
                      <p className="text-xs text-gray-400">No appointments scheduled yet. If a physical meeting is needed, you will be notified here and by email.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCase.appointments.map((a, i) => {
                          const typeIcon = a.type === "court" ? "⚖️" : a.type === "safespeak_office" ? "🏢" : "🚔";
                          const outcomeColors = {
                            resolved: "bg-green-100 text-green-700",
                            proceed_to_court: "bg-yellow-100 text-yellow-700",
                            needs_more_info: "bg-blue-100 text-blue-700",
                            dismissed: "bg-red-100 text-red-600",
                          };
                          return (
                            <div key={i} className="border border-gray-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-gray-800">{typeIcon} {a.date} at {a.time}</p>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${apptStatusColor[a.status]}`}>{a.status}</span>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-teal-500 shrink-0" /> {a.location}</div>
                                {a.stationName  && <div className="flex items-center gap-2"><span>🏢</span> {a.stationName}</div>}
                                {a.officerName  && <div className="flex items-center gap-2"><span>👮</span> {a.officerName}</div>}
                                {a.officerPhone && <div className="flex items-center gap-2"><span>📞</span> <a href={`tel:${a.officerPhone}`} className="text-blue-600 underline">{a.officerPhone}</a></div>}
                                {a.courtName    && <div className="flex items-center gap-2"><span>⚖️</span> {a.courtName}</div>}
                                {a.courtRoom    && <div className="flex items-center gap-2"><span>🚪</span> Room: {a.courtRoom}</div>}
                                {a.judge        && <div className="flex items-center gap-2"><span>👨‍⚖️</span> Judge: {a.judge}</div>}
                                {a.purpose      && (
                                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 mt-1">
                                    <p className="font-semibold text-yellow-800 mb-0.5">📋 What to bring:</p>
                                    <p className="text-yellow-700">{a.purpose}</p>
                                  </div>
                                )}
                              </div>
                              {a.outcome && a.outcome !== "pending" && (
                                <div className={`mt-3 rounded-lg p-2 text-xs ${outcomeColors[a.outcome] || "bg-gray-100 text-gray-600"}`}>
                                  <p className="font-semibold">Outcome: {a.outcome.replace(/_/g," ")}</p>
                                  {a.outcomeNote && <p className="mt-1">{a.outcomeNote}</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    <ChatBot />
    </>
  );
}
