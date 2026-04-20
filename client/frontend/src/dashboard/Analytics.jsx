import React, { useState, useEffect } from "react";
import { fetchCases } from "../services/api";

const BAR_COLORS = ["#1a2340", "#3b5bdb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases().then((data) => { setCases(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading analytics...</div>;

  const byType     = cases.reduce((a, c) => { a[c.classification] = (a[c.classification] || 0) + 1; return a; }, {});
  const byUrgency  = { High: 0, Medium: 0, Low: 0 };
  cases.forEach((c) => { if (byUrgency[c.urgency] !== undefined) byUrgency[c.urgency]++; });
  const byStatus   = cases.reduce((a, c) => { a[c.status] = (a[c.status] || 0) + 1; return a; }, {});
  const byLocation = cases.reduce((a, c) => { a[c.location] = (a[c.location] || 0) + 1; return a; }, {});

  const maxType    = Math.max(...Object.values(byType), 1);
  const maxLoc     = Math.max(...Object.values(byLocation), 1);
  const mostReported = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
  const criticalCount  = cases.filter((c) => c.urgency === "High").length;
  const resolvedCount  = cases.filter((c) => c.status === "Resolved").length;
  const resolutionRate = cases.length ? Math.round((resolvedCount / cases.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Analytics & Insights</h2>
        <p className="text-sm text-gray-500">Data-driven overview of all reported cases</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Cases",     value: cases.length,    color: "text-gray-800" },
          { label: "Critical (High)", value: criticalCount,   color: "text-red-500" },
          { label: "Resolved",        value: resolvedCount,   color: "text-green-600" },
          { label: "Resolution Rate", value: `${resolutionRate}%`, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Abuse type */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 text-sm mb-1">Abuse Type Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">
            Most reported: <span className="font-semibold text-gray-700">{mostReported?.[0]}</span> ({mostReported?.[1]} cases)
          </p>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count], i) => (
              <div key={type}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{type}</span><span className="font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${(count / maxType) * 100}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency + Status */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">Urgency Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "High",   color: "bg-red-500",    count: byUrgency.High },
              { label: "Medium", color: "bg-yellow-400", count: byUrgency.Medium },
              { label: "Low",    color: "bg-blue-400",   count: byUrgency.Low },
            ].map((u) => (
              <div key={u.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${u.color}`} />{u.label}
                  </span>
                  <span className="font-semibold">{u.count} ({cases.length ? Math.round((u.count / cases.length) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${u.color}`} style={{ width: `${cases.length ? (u.count / cases.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-gray-700 text-sm mt-6 mb-3">Status Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-gray-800">{count}</p>
                <p className="text-[10px] text-gray-500">{status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location chart */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 text-sm mb-4">Reports by Location</h3>
        <div className="flex items-end gap-4 h-28">
          {Object.entries(byLocation).map(([loc, count], i) => (
            <div key={loc} className="flex flex-col items-center flex-1">
              <span className="text-xs font-semibold text-gray-700 mb-1">{count}</span>
              <div className="w-full rounded-t-md" style={{ height: `${(count / maxLoc) * 80}px`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
              <span className="text-[9px] text-gray-500 mt-1">{loc}</span>
            </div>
          ))}
        </div>
      </div>

      <PatternDetection cases={cases} />
    </div>
  );
}

function PatternDetection({ cases }) {
  const locMap = {};
  cases.forEach((c) => { if (!locMap[c.location]) locMap[c.location] = []; locMap[c.location].push(c); });
  const hotspots = Object.entries(locMap).filter(([, arr]) => arr.length > 1);

  const typeMap = {};
  cases.forEach((c) => { if (!typeMap[c.classification]) typeMap[c.classification] = []; typeMap[c.classification].push(c.caseId); });
  const repeatedTypes = Object.entries(typeMap).filter(([, ids]) => ids.length >= 2);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-red-500 text-lg">⚠️</span>
        <h3 className="font-semibold text-gray-800 text-sm">Pattern Detection</h3>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
      </div>
      <div className="space-y-3">
        {hotspots.map(([loc, arr]) => (
          <div key={loc} className="bg-red-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-red-700">📍 {arr.length} reports from {loc}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">Cases: {arr.map((c) => c.caseId).join(", ")} — possible repeat offender or high-risk zone</p>
          </div>
        ))}
        {repeatedTypes.map(([type, ids]) => (
          <div key={type} className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-yellow-700">🔁 {ids.length} cases of {type}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">Cases: {ids.join(", ")} — recurring abuse type</p>
          </div>
        ))}
        {hotspots.length === 0 && repeatedTypes.length === 0 && (
          <p className="text-xs text-gray-400">No patterns detected yet.</p>
        )}
      </div>
    </div>
  );
}
