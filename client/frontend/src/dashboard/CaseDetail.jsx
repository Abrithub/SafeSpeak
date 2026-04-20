import React, { useState, useEffect } from "react";
import {
  fetchCase, updateStatus, addNote, sendMessage, scheduleAppointment,
  getCaseAppointments, assignCase, reopenCase, archiveCase,
} from "../services/api";
import {
  FaArrowLeft, FaRobot, FaLock, FaPaperPlane, FaStickyNote,
  FaCalendarAlt, FaUserTie, FaBuilding, FaRedo, FaArchive,
  FaImage, FaFilePdf, FaFileAlt, FaExternalLinkAlt,
} from "react-icons/fa";

const STATUS_FLOW = ["Pending", "Under Review", "In Progress", "Resolved"];
const urgencyColor = { High: "text-red-600 bg-red-50", Medium: "text-yellow-600 bg-yellow-50", Low: "text-blue-600 bg-blue-50" };
const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700", "Under Review": "bg-blue-100 text-blue-700",
  "In Progress": "bg-purple-100 text-purple-700", Resolved: "bg-green-100 text-green-700",
  Rejected: "bg-gray-100 text-gray-500", Archived: "bg-slate-100 text-slate-500",
};

export default function CaseDetail({ caseId, onBack }) {
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [apptForm, setApptForm] = useState({ date: "", time: "", location: "", notes: "" });
  const [apptSaving, setApptSaving] = useState(false);
  const [apptError, setApptError] = useState("");
  const [assignForm, setAssignForm] = useState({ officer: "", org: "" });
  const [assignSaving, setAssignSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const load = () => Promise.all([
    fetchCase(caseId).then(d => { setC(d); setAssignForm({ officer: d.officer || "", org: d.org || "" }); }),
    getCaseAppointments(caseId).then((d) => setAppointments(Array.isArray(d) ? d : [])),
  ]).then(() => setLoading(false));

  useEffect(() => { load(); }, [caseId]);

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading case...</div>;
  if (!c || c.message) return <div className="p-8 text-gray-500">Case not found.</div>;

  const stepIndex = STATUS_FLOW.indexOf(c.status);
  const isClosedCase = ["Resolved", "Rejected", "Archived"].includes(c.status);

  const handleStatus = async (status) => {
    setSaving(true);
    await updateStatus(c.caseId, status);
    await load();
    setSaving(false);
  };

  const handleNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    await addNote(c.caseId, note.trim());
    setNote("");
    await load();
    setSaving(false);
  };

  const handleMessage = async () => {
    if (!msg.trim()) return;
    setSaving(true);
    await sendMessage(c.caseId, msg.trim());
    setMsg("");
    await load();
    setSaving(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignSaving(true);
    await assignCase(c.caseId, assignForm.officer, assignForm.org);
    await load();
    setAssignSaving(false);
  };

  const handleReopen = async () => {
    if (!window.confirm("Reopen this case?")) return;
    setSaving(true);
    await reopenCase(c.caseId);
    await load();
    setSaving(false);
  };

  const handleArchive = async () => {
    if (!window.confirm("Archive this case? It will be stored for future reference.")) return;
    setSaving(true);
    await archiveCase(c.caseId);
    await load();
    setSaving(false);
  };

  const handleScheduleAppt = async (e) => {
    e.preventDefault();
    if (!c.reporterEmail) { setApptError("No email on file for this reporter."); return; }
    setApptSaving(true); setApptError("");
    try {
      const res = await scheduleAppointment({ caseId: c.caseId, ...apptForm });
      if (res.appointment) { setApptForm({ date: "", time: "", location: "", notes: "" }); await load(); }
      else setApptError(res.message || "Failed to schedule.");
    } catch { setApptError("Server error."); }
    finally { setApptSaving(false); }
  };

  const TABS = ["overview", "messages", "evidence", "assignment", "appointments"];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
        <FaArrowLeft /> Back to Cases
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">{c.caseId} · {new Date(c.createdAt).toLocaleDateString()}</p>
            <h2 className="text-xl font-bold text-gray-800">{c.classification}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgencyColor[c.urgency]}`}>{c.urgency} Priority</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[c.status] || ""}`}>{c.status}</span>
              <span className="text-xs text-gray-400">{c.location}</span>
              {c.officer !== "Unassigned" && <span className="text-xs text-gray-400">👤 {c.officer}</span>}
              {c.org !== "Unassigned" && <span className="text-xs text-gray-400">🏢 {c.org}</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {!isClosedCase && ["Under Review","In Progress","Resolved","Rejected"].map((s) => (
              <button key={s} onClick={() => handleStatus(s)} disabled={saving}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition disabled:opacity-50 ${
                  c.status === s ? "bg-[#1a2340] text-white border-[#1a2340]" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}>{s}</button>
            ))}
            {isClosedCase && (
              <button onClick={handleReopen} disabled={saving}
                className="text-xs px-3 py-1.5 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1 disabled:opacity-50">
                <FaRedo className="text-[10px]" /> Reopen
              </button>
            )}
            {c.status === "Resolved" && (
              <button onClick={handleArchive} disabled={saving}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1 disabled:opacity-50">
                <FaArchive className="text-[10px]" /> Archive
              </button>
            )}
          </div>
        </div>

        {/* Progress bar — only for active cases */}
        {!isClosedCase && (
          <div className="mt-4 flex items-center gap-0">
            {STATUS_FLOW.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i <= stepIndex ? "bg-[#1a2340] border-[#1a2340] text-white" : "bg-white border-gray-300 text-gray-400"
                  }`}>{i + 1}</div>
                  <span className="text-[9px] text-gray-500 mt-1 whitespace-nowrap">{s}</span>
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 ${i < stepIndex ? "bg-[#1a2340]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden shadow-sm">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-xs font-medium capitalize transition border-b-2 ${
              activeTab === t ? "border-[#1a2340] text-[#1a2340]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t === "messages" ? `💬 Messages (${(c.messages||[]).length})` :
             t === "evidence" ? `📎 Evidence (${(c.evidence||[]).length})` :
             t === "appointments" ? `📅 Appointments (${appointments.length})` :
             t === "assignment" ? "👤 Assignment" : "📋 Overview"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Case Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{c.description || "No description provided."}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
                {[
                  ["Reporting For", c.reportingFor], ["Relationship", c.relationship],
                  ["Age Range", c.ageRange], ["Gender", c.gender],
                  ["When", c.whenDidItHappen], ["Victim Safe?", c.isVictimSafe],
                  ["Contact Method", c.contactMethod], ["Phone", c.phone],
                ].filter(([,v]) => v && v !== "Prefer not to say").map(([l,v]) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-[10px]">{l}</p>
                    <p className="font-medium text-gray-700">{v}</p>
                  </div>
                ))}
              </div>
              {(c.abuseTypes||[]).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.abuseTypes.map(t => (
                    <span key={t} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#1a2340]">
              <div className="flex items-center gap-2 mb-3">
                <FaRobot className="text-[#1a2340]" />
                <h3 className="font-semibold text-gray-700 text-sm">AI Prioritization Analysis</h3>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-[#1a2340]">{c.aiScore}</div>
                <div>
                  <p className="text-xs text-gray-500">Risk Score / 100</p>
                  <div className="w-40 h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-2 rounded-full bg-[#1a2340]" style={{ width: `${c.aiScore}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{c.aiReason}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FaStickyNote className="text-yellow-500" />
                <h3 className="font-semibold text-gray-700 text-sm">Internal Notes</h3>
              </div>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {(c.notes||[]).length === 0 && <p className="text-xs text-gray-400">No notes yet.</p>}
                {(c.notes||[]).map((n) => (
                  <div key={n._id} className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-gray-700">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{n.author} · {new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNote()}
                  className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                  placeholder="Add internal note..." />
                <button onClick={handleNote} disabled={saving}
                  className="bg-[#1a2340] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#243060] disabled:opacity-50">Add</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Case Info</h3>
              <div className="space-y-2 text-xs text-gray-600">
                {[
                  ["Reported", new Date(c.createdAt).toLocaleString()],
                  ["Case ID", c.caseId],
                  ["Location", c.location],
                  ["Org", c.org],
                  ["Officer", c.officer],
                  ["Reporter Email", c.reporterEmail || "Anonymous"],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between gap-2">
                    <span className="text-gray-400 shrink-0">{l}</span>
                    <span className="font-medium text-right truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGES TAB ── */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <FaLock className="text-green-600" />
            <h3 className="font-semibold text-gray-700 text-sm">Secure Channel</h3>
          </div>
          <p className="text-[10px] text-gray-400 mb-4">Two-way anonymous communication with reporter</p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-96 overflow-y-auto space-y-2">
            {(c.messages||[]).length === 0 && <p className="text-xs text-gray-400 text-center py-8">No messages yet</p>}
            {(c.messages||[]).map((m) => (
              <div key={m._id} className={`rounded-lg p-3 text-xs max-w-[80%] ${
                m.from === "admin" ? "bg-[#1a2340] text-white ml-auto" : "bg-white border text-gray-700"
              }`}>
                <p>{m.text}</p>
                <p className={`text-[9px] mt-1 ${m.from === "admin" ? "text-white/60" : "text-gray-400"}`}>
                  {m.from === "admin" ? "You (Admin)" : "Reporter"} · {new Date(m.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={msg} onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMessage()}
              className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Message reporter..." />
            <button onClick={handleMessage} disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 text-xs">
              <FaPaperPlane className="text-[10px]" /> Send
            </button>
          </div>
        </div>
      )}

      {/* ── EVIDENCE TAB ── */}
      {activeTab === "evidence" && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">📎 Uploaded Evidence</h3>
          {(c.evidence||[]).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaFileAlt className="text-4xl mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No evidence uploaded for this case.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {c.evidence.map((e, i) => {
                const isImage = e.type?.startsWith("image");
                const isPdf = e.type?.includes("pdf");
                return (
                  <a key={i} href={e.url} target="_blank" rel="noopener noreferrer"
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition group">
                    {isImage ? (
                      <img src={e.url} alt={`Evidence ${i+1}`} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gray-50 flex items-center justify-center">
                        {isPdf ? <FaFilePdf className="text-4xl text-red-400" /> : <FaFileAlt className="text-4xl text-gray-400" />}
                      </div>
                    )}
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 truncate">{e.type || "File"}</span>
                      <FaExternalLinkAlt className="text-[10px] text-gray-400 group-hover:text-sky-500" />
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ASSIGNMENT TAB ── */}
      {activeTab === "assignment" && (
        <div className="bg-white rounded-xl shadow-sm p-5 max-w-lg">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">👤 Assign Case</h3>
          <form onSubmit={handleAssign} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <FaUserTie className="text-[10px]" /> Assigned Officer
              </label>
              <input value={assignForm.officer} onChange={(e) => setAssignForm({...assignForm, officer: e.target.value})}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                placeholder="Officer name or ID" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <FaBuilding className="text-[10px]" /> Organization
              </label>
              <input value={assignForm.org} onChange={(e) => setAssignForm({...assignForm, org: e.target.value})}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                placeholder="Organization name" />
            </div>
            <button type="submit" disabled={assignSaving}
              className="w-full bg-[#1a2340] text-white py-2 rounded-lg text-xs font-medium hover:bg-[#243060] disabled:opacity-50">
              {assignSaving ? "Saving..." : "Save Assignment"}
            </button>
          </form>
          {(c.officer !== "Unassigned" || c.org !== "Unassigned") && (
            <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
              <p>Currently assigned to: <span className="font-semibold">{c.officer}</span></p>
              <p>Organization: <span className="font-semibold">{c.org}</span></p>
            </div>
          )}
        </div>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {activeTab === "appointments" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" /> Schedule Appointment
            </h3>
            {c.reporterEmail ? (
              <p className="text-[10px] text-gray-400 mb-3">Notifying: <span className="font-medium text-gray-600">{c.reporterEmail}</span></p>
            ) : (
              <p className="text-[10px] text-red-400 mb-3">No email on file — reporter did not provide email.</p>
            )}
            <form onSubmit={handleScheduleAppt} className="space-y-2">
              <input type="date" value={apptForm.date} onChange={(e) => setApptForm({...apptForm, date: e.target.value})}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              <input type="time" value={apptForm.time} onChange={(e) => setApptForm({...apptForm, time: e.target.value})}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              <input type="text" value={apptForm.location} onChange={(e) => setApptForm({...apptForm, location: e.target.value})}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Office address or location" required />
              <textarea value={apptForm.notes} onChange={(e) => setApptForm({...apptForm, notes: e.target.value})}
                className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Additional notes (optional)" rows={2} />
              {apptError && <p className="text-red-500 text-[10px]">{apptError}</p>}
              <button type="submit" disabled={apptSaving}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                {apptSaving ? "Scheduling..." : "Schedule & Notify Reporter"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Scheduled Appointments</h3>
            {appointments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No appointments yet.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a._id} className="bg-blue-50 rounded-lg p-3 text-xs">
                    <p className="font-semibold text-blue-700">{a.date} at {a.time}</p>
                    <p className="text-gray-600 mt-1">📍 {a.location}</p>
                    {a.notes && <p className="text-gray-500 mt-1">{a.notes}</p>}
                    <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full ${
                      a.status === "Scheduled" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                    }`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
