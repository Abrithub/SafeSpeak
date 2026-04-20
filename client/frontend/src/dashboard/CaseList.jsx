import React, { useState, useEffect } from "react";
import { fetchCases } from "../services/api";
import { FaSearch, FaFilter, FaRobot } from "react-icons/fa";

const urgencyDot = { High: "bg-red-500", Medium: "bg-yellow-400", Low: "bg-blue-400" };
const urgencyBg  = { High: "bg-red-50 border-red-200", Medium: "bg-yellow-50 border-yellow-200", Low: "bg-blue-50 border-blue-200" };
const statusColor = {
  Pending: "text-yellow-600 bg-yellow-50", "Under Review": "text-blue-600 bg-blue-50",
  "In Progress": "text-purple-600 bg-purple-50", Resolved: "text-green-600 bg-green-50",
  Rejected: "text-gray-500 bg-gray-100",
};

export default function CaseList({ onViewCase }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const statuses = ["All", "Pending", "Under Review", "In Progress", "Resolved", "Rejected"];

  useEffect(() => {
    fetchCases().then((data) => {
      setCases(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const types = ["All", ...new Set(cases.map((c) => c.classification))];

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    return (
      (filterUrgency === "All" || c.urgency === filterUrgency) &&
      (filterStatus === "All" || c.status === filterStatus) &&
      (filterType === "All" || c.classification === filterType) &&
      (!q || (c.caseId||"").toLowerCase().includes(q) || (c.classification||"").toLowerCase().includes(q) || (c.location||"").toLowerCase().includes(q))
    );
  });

  const critical = filtered.filter((c) => c.urgency === "High" && c.status === "Pending");

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading cases...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Case Management</h2>
        <p className="text-sm text-gray-500">All cases sorted by AI risk score</p>
      </div>

      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-bold text-red-700">
              {critical.length} Critical Case{critical.length > 1 ? "s" : ""} Need Immediate Attention
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {critical.map((c) => c.caseId).join(", ")} — High urgency, still pending
            </p>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2340]"
            placeholder="Search by case ID, type, location..." />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FaFilter className="text-gray-400 text-xs" />
          {["All","High","Medium","Low"].map((u) => (
            <button key={u} onClick={() => setFilterUrgency(u)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterUrgency === u ? "bg-[#1a2340] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {u}
            </button>
          ))}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none">
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none">
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">No cases match your filters.</div>
        )}
        {filtered.map((c) => (
          <div key={c._id} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${urgencyBg[c.urgency]} hover:shadow-md transition cursor-pointer`}
            onClick={() => onViewCase(c.caseId)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-gray-700">{c.caseId}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>{c.status}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <span className={`w-2 h-2 rounded-full ${urgencyDot[c.urgency]}`} />{c.urgency}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{c.classification}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.location} · {c.org} · {c.officer}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <FaRobot className="text-[#1a2340] text-xs" />
                  <span className="text-xs font-bold text-[#1a2340]">{c.aiScore}</span>
                  <span className="text-[10px] text-gray-400">/ 100</span>
                </div>
                <p className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                <p className="text-[10px] text-blue-500 mt-1">View →</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
