import React, { useState, useEffect } from "react";
import {
  fetchCase, updateStatus, addNote, sendMessage, scheduleAppointment,
  getCaseAppointments, assignCase, reopenCase, archiveCase, deleteCase, referCase,
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
  const [apptForm, setApptForm] = useState({ type: "police_station", date: "", time: "", location: "", stationName: "", officerName: "", officerPhone: "", courtName: "", courtRoom: "", judge: "", purpose: "", notes: "" });
  const [apptSaving, setApptSaving] = useState(false);
  const [apptError, setApptError] = useState("");
  const [assignForm, setAssignForm] = useState({ officer: "", org: "" });
  const [assignSaving, setAssignSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [referralType, setReferralType] = useState("");
  const [referralForm, setReferralForm] = useState({
    stationName:"", stationAddress:"", officerName:"", officerPhone:"",
    courtName:"", courtDate:"", courtTime:"", courtRoom:"", judge:"",
    infoRequest:"", infoDeadline:"", referralNote:"",
  });
  const [referralSaving, setReferralSaving] = useState(false);

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

  const handleReferral = async (e) => {
    e.preventDefault();
    if (!referralType) return;
    setReferralSaving(true);
    await referCase(c.caseId, { type: referralType, ...referralForm });
    await load();
    setReferralSaving(false);
  };

  const handleScheduleAppt = async (e) => {
    e.preventDefault();
    setApptSaving(true); setApptError("");
    try {
      const res = await scheduleAppointment({ caseId: c.caseId, ...apptForm });
      if (res.appointment) { setApptForm({ date: "", time: "", location: "", notes: "" }); await load(); }
      else setApptError(res.message || "Failed to schedule.");
    } catch { setApptError("Server error."); }
    finally { setApptSaving(false); }
  };

  const TABS = ["overview", "referral", "messages", "evidence", "assignment", "appointments"];

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
             t === "assignment" ? "👤 Assignment" :
             t === "referral" ? `🔀 Refer Case${c.referral?.type ? " ✓" : ""}` :
             "📋 Overview"}
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

      {/* ── REFERRAL TAB ── */}
      {activeTab === "referral" && (
        <div className="space-y-4">
          {/* Show existing referral if set */}
          {c.referral?.type && (
            <div className={`rounded-xl p-5 border-l-4 ${
              c.referral.type === "police" ? "bg-blue-50 border-blue-500" :
              c.referral.type === "court"  ? "bg-yellow-50 border-yellow-500" :
              "bg-orange-50 border-orange-500"
            }`}>
              <p className="text-sm font-bold text-gray-800 mb-3">
                {c.referral.type === "police" ? "🚔 Referred to Police Station" :
                 c.referral.type === "court"  ? "⚖️ Referred to Court" :
                 "📋 Information Requested"}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {c.referral.type === "police" && <>
                  {c.referral.stationName    && <div><span className="text-gray-400">Station:</span> {c.referral.stationName}</div>}
                  {c.referral.stationAddress && <div><span className="text-gray-400">Address:</span> {c.referral.stationAddress}</div>}
                  {c.referral.officerName    && <div><span className="text-gray-400">Officer:</span> {c.referral.officerName}</div>}
                  {c.referral.officerPhone   && <div><span className="text-gray-400">Phone:</span> {c.referral.officerPhone}</div>}
                </>}
                {c.referral.type === "court" && <>
                  {c.referral.courtName && <div><span className="text-gray-400">Court:</span> {c.referral.courtName}</div>}
                  {c.referral.courtDate && <div><span className="text-gray-400">Date:</span> {c.referral.courtDate}</div>}
                  {c.referral.courtTime && <div><span className="text-gray-400">Time:</span> {c.referral.courtTime}</div>}
                  {c.referral.courtRoom && <div><span className="text-gray-400">Room:</span> {c.referral.courtRoom}</div>}
                  {c.referral.judge     && <div><span className="text-gray-400">Judge:</span> {c.referral.judge}</div>}
                </>}
                {c.referral.type === "info_request" && <>
                  {c.referral.infoRequest  && <div className="col-span-2"><span className="text-gray-400">Requested:</span> {c.referral.infoRequest}</div>}
                  {c.referral.infoDeadline && <div><span className="text-gray-400">Deadline:</span> {c.referral.infoDeadline}</div>}
                </>}
              </div>
              {c.referral.referralNote && (
                <p className="text-xs text-gray-600 mt-2 bg-white rounded p-2">{c.referral.referralNote}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-2">
                Referred by {c.referral.referredBy} · {c.referral.referredAt ? new Date(c.referral.referredAt).toLocaleString() : ""}
              </p>
            </div>
          )}

          {/* Referral form */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-4">
              {c.referral?.type ? "Update Referral" : "Refer This Case"}
            </h3>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { key: "police", icon: "🚔", label: "Police Station", color: "border-blue-400 bg-blue-50 text-blue-700" },
                { key: "court",  icon: "⚖️", label: "Court",          color: "border-yellow-400 bg-yellow-50 text-yellow-700" },
                { key: "info_request", icon: "📋", label: "Need More Info", color: "border-orange-400 bg-orange-50 text-orange-700" },
              ].map(opt => (
                <button key={opt.key} type="button"
                  onClick={() => setReferralType(opt.key)}
                  className={`border-2 rounded-xl p-3 text-center transition ${
                    referralType === opt.key ? opt.color + " border-2" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="text-xs font-semibold">{opt.label}</div>
                </button>
              ))}
            </div>

            {referralType && (
              <form onSubmit={handleReferral} className="space-y-3">
                {/* Police fields */}
                {referralType === "police" && <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Station Name <span className="text-red-500">*</span></label>
                      <input value={referralForm.stationName} onChange={e => setReferralForm({...referralForm, stationName: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. Bole Police Station" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Station Address</label>
                      <input value={referralForm.stationAddress} onChange={e => setReferralForm({...referralForm, stationAddress: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Full address" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Assigned Officer</label>
                      <input value={referralForm.officerName} onChange={e => setReferralForm({...referralForm, officerName: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Officer name" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Officer Phone</label>
                      <input value={referralForm.officerPhone} onChange={e => setReferralForm({...referralForm, officerPhone: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="+251 9xx xxx xxx" />
                    </div>
                  </div>
                </>}

                {/* Court fields */}
                {referralType === "court" && <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Court Name <span className="text-red-500">*</span></label>
                      <input value={referralForm.courtName} onChange={e => setReferralForm({...referralForm, courtName: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g. Addis Ababa Federal High Court" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Court Date <span className="text-red-500">*</span></label>
                      <input type="date" value={referralForm.courtDate} onChange={e => setReferralForm({...referralForm, courtDate: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Court Time <span className="text-red-500">*</span></label>
                      <input type="time" value={referralForm.courtTime} onChange={e => setReferralForm({...referralForm, courtTime: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Court Room / Hall</label>
                      <input value={referralForm.courtRoom} onChange={e => setReferralForm({...referralForm, courtRoom: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g. Hall 3" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Judge Name</label>
                      <input value={referralForm.judge} onChange={e => setReferralForm({...referralForm, judge: e.target.value})}
                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Judge name (optional)" />
                    </div>
                  </div>
                </>}

                {/* Info request fields */}
                {referralType === "info_request" && <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">What information is needed? <span className="text-red-500">*</span></label>
                    <textarea value={referralForm.infoRequest} onChange={e => setReferralForm({...referralForm, infoRequest: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      rows={3} placeholder="Describe what additional information is needed from the reporter..." required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Response Deadline</label>
                    <input type="date" value={referralForm.infoDeadline} onChange={e => setReferralForm({...referralForm, infoDeadline: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                </>}

                {/* Common note */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Note to Reporter (optional)</label>
                  <textarea value={referralForm.referralNote} onChange={e => setReferralForm({...referralForm, referralNote: e.target.value})}
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
                    rows={2} placeholder="Any additional instructions or context for the reporter..." />
                </div>

                {!c.reporterEmail && (
                  <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                    ⚠️ No email on file — reporter will not receive an email notification.
                  </p>
                )}

                <button type="submit" disabled={referralSaving}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50 ${
                    referralType === "police" ? "bg-blue-600 hover:bg-blue-700" :
                    referralType === "court"  ? "bg-yellow-600 hover:bg-yellow-700" :
                    "bg-orange-600 hover:bg-orange-700"
                  }`}>
                  {referralSaving ? "Sending..." :
                   referralType === "police" ? "🚔 Refer to Police & Notify Reporter" :
                   referralType === "court"  ? "⚖️ Schedule Court Date & Notify Reporter" :
                   "📋 Request Information & Notify Reporter"}
                </button>
              </form>
            )}
          </div>
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
        <div className="space-y-4">
          {/* Schedule form */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" /> Schedule Appointment
            </h3>
            {c.reporterEmail
              ? <p className="text-[10px] text-gray-400 mb-3">Email notification will be sent to: <span className="font-medium text-gray-600">{c.reporterEmail}</span></p>
              : <p className="text-[10px] text-orange-500 mb-3">⚠️ No email on file — appointment will appear in My Cases but no email will be sent.</p>
            }
            <form onSubmit={handleScheduleAppt} className="space-y-3">
              {/* Type */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Appointment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "police_station", icon: "🚔", label: "Police Station" },
                    { v: "court",          icon: "⚖️", label: "Court" },
                    { v: "safespeak_office", icon: "🏢", label: "Office" },
                  ].map(opt => (
                    <button key={opt.v} type="button"
                      onClick={() => setApptForm({...apptForm, type: opt.v})}
                      className={`border rounded-lg p-2 text-center text-xs transition ${
                        apptForm.type === opt.v ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className="text-lg mb-0.5">{opt.icon}</div>{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date / Time / Location */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date *</label>
                  <input type="date" value={apptForm.date} onChange={e => setApptForm({...apptForm, date: e.target.value})}
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Time *</label>
                  <input type="time" value={apptForm.time} onChange={e => setApptForm({...apptForm, time: e.target.value})}
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Location / Address *</label>
                <input type="text" value={apptForm.location} onChange={e => setApptForm({...apptForm, location: e.target.value})}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Full address" required />
              </div>

              {/* Police fields */}
              {apptForm.type === "police_station" && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Station Name</label>
                    <input value={apptForm.stationName||""} onChange={e => setApptForm({...apptForm, stationName: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="e.g. Bole Police Station" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Officer Name</label>
                    <input value={apptForm.officerName||""} onChange={e => setApptForm({...apptForm, officerName: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Officer name" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Officer Phone</label>
                    <input value={apptForm.officerPhone||""} onChange={e => setApptForm({...apptForm, officerPhone: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="+251 9xx xxx xxx" />
                  </div>
                </div>
              )}

              {/* Court fields */}
              {apptForm.type === "court" && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-yellow-50 rounded-lg">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Court Name</label>
                    <input value={apptForm.courtName||""} onChange={e => setApptForm({...apptForm, courtName: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g. Addis Ababa Federal High Court" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Room / Hall</label>
                    <input value={apptForm.courtRoom||""} onChange={e => setApptForm({...apptForm, courtRoom: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g. Hall 3" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Judge</label>
                    <input value={apptForm.judge||""} onChange={e => setApptForm({...apptForm, judge: e.target.value})}
                      className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Judge name" />
                  </div>
                </div>
              )}

              {/* Purpose */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">What to bring / What to expect</label>
                <textarea value={apptForm.purpose||""} onChange={e => setApptForm({...apptForm, purpose: e.target.value})}
                  className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. Bring valid ID, case documents, witness names..." rows={2} />
              </div>

              {apptError && <p className="text-red-500 text-[10px]">{apptError}</p>}
              <button type="submit" disabled={apptSaving}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">
                {apptSaving ? "Scheduling..." : "📅 Schedule & Notify Reporter"}
              </button>
            </form>
          </div>

          {/* Appointments list with outcome recording */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Appointment History</h3>
            {appointments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No appointments yet.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map(a => (
                  <AppointmentCard key={a._id} appt={a} caseId={c.caseId} onUpdate={load} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Appointment card with outcome recording ───────────────────────────────────
function AppointmentCard({ appt, caseId, onUpdate }) {
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcome, setOutcome]         = useState(appt.outcome || "pending");
  const [outcomeNote, setOutcomeNote] = useState(appt.outcomeNote || "");
  const [saving, setSaving]           = useState(false);
  const { updateAppointmentOutcome }  = require ? {} : {};

  const saveOutcome = async () => {
    setSaving(true);
    await fetch(`/api/appointments/${appt._id}/outcome`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ outcome, outcomeNote }),
    });
    await onUpdate();
    setSaving(false);
    setShowOutcome(false);
  };

  const typeIcon = appt.type === "court" ? "⚖️" : appt.type === "safespeak_office" ? "🏢" : "🚔";
  const outcomeColors = {
    pending:         "bg-gray-100 text-gray-600",
    resolved:        "bg-green-100 text-green-700",
    proceed_to_court:"bg-yellow-100 text-yellow-700",
    needs_more_info: "bg-blue-100 text-blue-700",
    dismissed:       "bg-red-100 text-red-600",
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-gray-700">{typeIcon} {appt.date} at {appt.time}</p>
          <p className="text-xs text-gray-500 mt-0.5">📍 {appt.location}</p>
          {appt.stationName  && <p className="text-xs text-gray-500">🏢 {appt.stationName}</p>}
          {appt.officerName  && <p className="text-xs text-gray-500">👮 {appt.officerName} {appt.officerPhone ? `· ${appt.officerPhone}` : ""}</p>}
          {appt.courtName    && <p className="text-xs text-gray-500">⚖️ {appt.courtName} {appt.courtRoom ? `· ${appt.courtRoom}` : ""}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            appt.status === "Scheduled" ? "bg-blue-100 text-blue-600" :
            appt.status === "Completed" ? "bg-green-100 text-green-600" :
            appt.status === "Cancelled" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
          }`}>{appt.status}</span>
          {appt.outcome !== "pending" && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${outcomeColors[appt.outcome]}`}>
              {appt.outcome.replace(/_/g," ")}
            </span>
          )}
        </div>
      </div>

      {appt.outcomeNote && (
        <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 mb-2">{appt.outcomeNote}</p>
      )}

      {/* Record outcome button */}
      {appt.status !== "Cancelled" && (
        <button onClick={() => setShowOutcome(!showOutcome)}
          className="text-xs text-blue-600 hover:underline">
          {appt.outcome === "pending" ? "📝 Record Outcome" : "✏️ Update Outcome"}
        </button>
      )}

      {showOutcome && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
          <label className="text-xs text-gray-500 block">Outcome</label>
          <select value={outcome} onChange={e => setOutcome(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="pending">Pending</option>
            <option value="resolved">✅ Resolved — Case Closed</option>
            <option value="proceed_to_court">⚖️ Proceed to Court</option>
            <option value="needs_more_info">📋 Needs More Information</option>
            <option value="dismissed">❌ Dismissed</option>
          </select>
          <textarea value={outcomeNote} onChange={e => setOutcomeNote(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Explain the outcome to the reporter..." rows={2} />
          <div className="flex gap-2">
            <button onClick={saveOutcome} disabled={saving}
              className="flex-1 bg-[#1a2340] text-white py-1.5 rounded-lg text-xs font-medium hover:bg-[#243060] disabled:opacity-50">
              {saving ? "Saving..." : "Save & Notify Reporter"}
            </button>
            <button onClick={() => setShowOutcome(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
