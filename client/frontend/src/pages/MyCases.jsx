import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaShieldAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaSignOutAlt, FaFileAlt, FaLock, FaPaperPlane } from "react-icons/fa";
import { getMyCases, replyMessage } from "../services/api";

// Reporter reply component
function ReplyBox({ caseId, onSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await replyMessage(caseId, text.trim());
    setText("");
    onSent();
    setSending(false);
  };
  return (
    <div className="flex gap-2">
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

const statusColor = {
  Pending:        "bg-yellow-100 text-yellow-700",
  "Under Review": "bg-blue-100 text-blue-700",
  "In Progress":  "bg-purple-100 text-purple-700",
  Resolved:       "bg-green-100 text-green-700",
  Rejected:       "bg-gray-100 text-gray-500",
};

const urgencyDot = { High: "bg-red-500", Medium: "bg-yellow-400", Low: "bg-blue-400" };
const STATUS_FLOW = ["Pending", "Under Review", "In Progress", "Resolved"];

const apptStatusColor = {
  Scheduled: "bg-blue-100 text-blue-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
  Completed: "bg-gray-100 text-gray-500",
};

export default function MyCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || user.role === "admin") { navigate("/login"); return; }
    getMyCases().then((data) => {
      if (Array.isArray(data)) setCases(data);
      else setError(data.message || "Failed to load cases.");
      setLoading(false);
    }).catch(() => { setError("Server unreachable."); setLoading(false); });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const selectedCase = cases.find((c) => c.caseId === selected);
  const stepIndex = selectedCase ? STATUS_FLOW.indexOf(selectedCase.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0f766e] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-xl" />
          <div>
            <p className="font-bold text-sm">SafeSpeak — My Cases</p>
            <p className="text-xs text-white/70">Logged in as {user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/report" className="text-xs bg-white text-teal-700 px-3 py-1.5 rounded-lg font-medium hover:bg-teal-50 transition">
            + New Report
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && <p className="text-center text-gray-400 py-20">Loading your cases...</p>}
        {error && <p className="text-center text-red-500 py-10">{error}</p>}

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
            {/* Case list */}
            <div className="md:col-span-1 space-y-3">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">Your Reports ({cases.length})</h2>
              {cases.map((c) => (
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
                    <span className={`w-2 h-2 rounded-full ${urgencyDot[c.urgency]}`} />
                    <span className="text-xs text-gray-500">{c.urgency} · {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  {(c.appointments || []).filter(a => a.status === "Scheduled").length > 0 && (
                    <p className="text-[10px] text-blue-600 mt-1 font-medium">📅 Appointment scheduled</p>
                  )}
                </button>
              ))}
            </div>

            {/* Case detail */}
            <div className="md:col-span-2">
              {!selectedCase ? (
                <div className="bg-white rounded-xl p-10 text-center text-gray-400 shadow-sm">
                  <FaShieldAlt className="text-4xl mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">Select a case to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status card */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400">{selectedCase.caseId}</p>
                        <h3 className="text-lg font-bold text-gray-800">{selectedCase.classification}</h3>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[selectedCase.status]}`}>
                        {selectedCase.status}
                      </span>
                    </div>

                    {/* Progress */}
                    <p className="text-xs text-gray-500 mb-3">Case Progress</p>
                    <div className="flex items-center mb-2">
                      {STATUS_FLOW.map((s, i) => (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                              i <= stepIndex ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-gray-300 text-gray-400"
                            }`}>{i + 1}</div>
                            <span className="text-[9px] text-gray-500 mt-1 whitespace-nowrap">{s}</span>
                          </div>
                          {i < STATUS_FLOW.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 ${i < stepIndex ? "bg-teal-600" : "bg-gray-200"}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Messages from support — with reply */}
                  {(selectedCase.messages || []).length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-5">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaLock className="text-green-600 text-xs" /> Secure Messages
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                        {selectedCase.messages.map((m, i) => (
                          <div key={i} className={`rounded-lg p-3 text-xs max-w-[80%] ${
                            m.from === "admin" ? "bg-teal-50 border border-teal-100" : "bg-[#1a2340] text-white ml-auto"
                          }`}>
                            <p className={m.from === "admin" ? "text-gray-700" : "text-white"}>{m.text}</p>
                            <p className={`text-[10px] mt-1 ${m.from === "admin" ? "text-gray-400" : "text-white/60"}`}>
                              {m.from === "admin" ? "Support Team" : "You"} · {new Date(m.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      <ReplyBox caseId={selectedCase.caseId} onSent={() => getMyCases().then(d => { if (Array.isArray(d)) setCases(d); })} />
                    </div>
                  )}

                  {/* Appointments */}
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-500" /> Appointments
                    </h4>
                    {(selectedCase.appointments || []).length === 0 ? (
                      <p className="text-xs text-gray-400">No appointments scheduled yet. If a physical meeting is needed, you will be notified by email.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCase.appointments.map((a, i) => (
                          <div key={i} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${apptStatusColor[a.status]}`}>{a.status}</span>
                              <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FaCalendarAlt className="text-teal-500 text-xs shrink-0" /> {a.date}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FaClock className="text-teal-500 text-xs shrink-0" /> {a.time}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FaMapMarkerAlt className="text-teal-500 text-xs shrink-0" /> {a.location}
                              </div>
                              {a.notes && <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">{a.notes}</p>}
                            </div>
                          </div>
                        ))}
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
  );
}
