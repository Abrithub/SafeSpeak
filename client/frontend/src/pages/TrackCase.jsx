import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaShieldAlt, FaCalendarAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { trackCase, getReporterAppointments } from "../services/api";
import { openChatBot } from "../components/ChatBot";

const statusColor = {
  Pending:        "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  "In Progress":  "bg-purple-100 text-purple-700 border-purple-200",
  Resolved:       "bg-green-100 text-green-700 border-green-200",
  Rejected:       "bg-gray-100 text-gray-500 border-gray-200",
};

const apptStatusColor = {
  Scheduled:  "bg-blue-100 text-blue-700",
  Confirmed:  "bg-green-100 text-green-700",
  Cancelled:  "bg-red-100 text-red-600",
  Completed:  "bg-gray-100 text-gray-500",
};

const STATUS_FLOW = ["Pending", "Under Review", "In Progress", "Resolved"];

export default function TrackCase() {
  const [email, setEmail] = useState("");
  const [caseId, setCaseId] = useState("");
  const [result, setResult] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("case"); // "case" | "appointments"

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!caseId.trim() || !email.trim()) return;
    setLoading(true); setError(""); setResult(null); setAllAppointments([]);
    try {
      const [caseRes, apptRes] = await Promise.all([
        trackCase(caseId.trim().toUpperCase(), email.trim()),
        getReporterAppointments(email.trim()),
      ]);
      if (caseRes.message) { setError(caseRes.message); }
      else {
        setResult(caseRes);
        setAllAppointments(Array.isArray(apptRes) ? apptRes : []);
      }
    } catch { setError("Server unreachable. Please try again."); }
    finally { setLoading(false); }
  };

  const stepIndex = result ? STATUS_FLOW.indexOf(result.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaShieldAlt className="text-teal-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Track Your Case</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and Case ID to view your case status and appointments
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleTrack} className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <FaEnvelope className="inline mr-1 text-teal-500" /> Email Address
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="The email you used when submitting the report" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Case ID</label>
              <div className="flex gap-2">
                <input value={caseId} onChange={(e) => setCaseId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="e.g. CASE-1001" required />
                <button type="submit" disabled={loading}
                  className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-60 flex items-center gap-2">
                  <FaSearch /> {loading ? "..." : "Track"}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-3 bg-red-50 p-2 rounded-lg">{error}</p>}
        </form>

        {result && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              {["case", "appointments"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-medium transition ${tab === t ? "border-b-2 border-teal-600 text-teal-600" : "text-gray-500 hover:text-gray-700"}`}>
                  {t === "case" ? "📋 Case Status" : `📅 Appointments (${allAppointments.length})`}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ── CASE TAB ── */}
              {tab === "case" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Case ID</p>
                      <p className="text-lg font-mono font-bold text-gray-800">{result.caseId}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor[result.status]}`}>
                      {result.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Type</p>
                      <p className="font-medium text-gray-700 text-sm">{result.classification}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
                      <p className="font-medium text-gray-700 text-sm">{new Date(result.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Case Progress</p>
                    <div className="flex items-center">
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

                  {/* Messages from support */}
                  {result.messages?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Messages from Support Team</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {result.messages.map((m, i) => (
                          <div key={i} className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{m.text}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(m.time).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming appointment alert */}
                  {allAppointments.filter(a => a.status === "Scheduled" || a.status === "Confirmed").length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <FaCalendarAlt className="text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-700">You have an upcoming appointment</p>
                        <p className="text-xs text-blue-500 mt-0.5">
                          {allAppointments[0].date} at {allAppointments[0].time} — {allAppointments[0].location}
                        </p>
                        <button onClick={() => setTab("appointments")} className="text-xs text-blue-600 underline mt-1">
                          View details →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── APPOINTMENTS TAB ── */}
              {tab === "appointments" && (
                <div className="space-y-4">
                  {allAppointments.length === 0 ? (
                    <div className="text-center py-10">
                      <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No appointments scheduled yet.</p>
                      <p className="text-gray-400 text-xs mt-1">If a physical meeting is needed, the support team will notify you by email.</p>
                    </div>
                  ) : (
                    allAppointments.map((a) => (
                      <div key={a._id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-xs font-semibold text-gray-500">{a.caseId}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${apptStatusColor[a.status]}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaCalendarAlt className="text-teal-500 shrink-0" />
                            <span>{a.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaClock className="text-teal-500 shrink-0" />
                            <span>{a.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaMapMarkerAlt className="text-teal-500 shrink-0" />
                            <span>{a.location}</span>
                          </div>
                          {a.notes && (
                            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mt-1">{a.notes}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="px-6 pb-4">
              <p className="text-xs text-gray-400 text-center">
                Your identity remains protected. Case details are only visible with your email + Case ID.
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-5">
          <Link to="/home" className="text-xs text-gray-400 hover:underline">← Back to Home</Link>
        </div>

        {/* Mentor help nudge */}
        <button
          type="button"
          onClick={openChatBot}
          className="mt-4 w-full flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 hover:bg-sky-100 transition text-left"
        >
          <FiMessageCircle className="text-sky-500 text-lg shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-sky-800">Need help understanding your case?</p>
            <p className="text-xs text-sky-600">Our AI Mentor can explain what each status means and what to expect next.</p>
          </div>
          <span className="text-xs text-sky-500 font-medium shrink-0">Ask →</span>
        </button>
      </div>
    </div>
  );
}
