import React, { useState, useEffect } from "react";
import { fetchCases } from "../services/api";

export default function ActivityLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases().then((cases) => {
      if (!Array.isArray(cases)) { setLoading(false); return; }
      const all = [];
      cases.forEach((c) => {
        all.push({ time: c.createdAt, type: "submitted", caseId: c.caseId, text: `Case ${c.caseId} submitted — ${c.classification}`, urgency: c.urgency });
        (c.notes || []).forEach((n) => {
          all.push({ time: n.createdAt, type: "note", caseId: c.caseId, text: `[${c.caseId}] Note by ${n.author}: "${n.text}"`, urgency: c.urgency });
        });
        if (c.status !== "Pending") {
          all.push({ time: c.updatedAt, type: "status", caseId: c.caseId, text: `${c.caseId} status updated to "${c.status}"`, urgency: c.urgency });
        }
      });
      all.sort((a, b) => new Date(b.time) - new Date(a.time));
      setEvents(all);
      setLoading(false);
    });
  }, []);

  const iconMap = {
    submitted: { bg: "bg-blue-100",   dot: "bg-blue-500" },
    note:      { bg: "bg-yellow-100", dot: "bg-yellow-500" },
    status:    { bg: "bg-green-100",  dot: "bg-green-500" },
  };

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading activity...</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Activity Log</h2>
        <p className="text-sm text-gray-500">Full timestamped audit trail of all case activity</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-5">
            {events.length === 0 && <p className="text-xs text-gray-400 pl-10">No activity yet.</p>}
            {events.map((e, i) => {
              const meta = iconMap[e.type];
              return (
                <div key={i} className="flex gap-4 relative">
                  <div className={`w-7 h-7 rounded-full ${meta.dot} shrink-0 z-10 flex items-center justify-center`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                  <div className={`flex-1 rounded-xl p-3 ${meta.bg}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-gray-700">{e.text}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        e.urgency === "High" ? "bg-red-100 text-red-600" :
                        e.urgency === "Medium" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"
                      }`}>{e.urgency}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(e.time).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
