import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome, FaFileAlt, FaFolderOpen, FaClipboardList,
  FaCog, FaChartBar, FaUserCircle, FaSignOutAlt, FaBell
} from "react-icons/fa";

import { fetchCases } from "../services/api";
import CaseList    from "../dashboard/CaseList.jsx";
import CaseDetail  from "../dashboard/CaseDetail.jsx";
import Analytics   from "../dashboard/Analytics.jsx";
import ActivityLog from "../dashboard/ActivityLog.jsx";
import { getCases } from "../data/casesData";

const NAV = [
  { icon: <FaHome />,          label: "Dashboard",       key: "home" },
  { icon: <FaFileAlt />,       label: "Reports",         key: "reports" },
  { icon: <FaFolderOpen />,    label: "Case Management", key: "cases" },
  { icon: <FaClipboardList />, label: "Activity Log",    key: "activity" },
  { icon: <FaChartBar />,      label: "Analytics",       key: "analytics" },
  { icon: <FaCog />,           label: "Settings",        key: "settings" },
];

const urgencyDot = { High: "bg-red-500", Medium: "bg-yellow-400", Low: "bg-blue-400" };
const statusColor = {
  Pending: "text-yellow-600", "Under Review": "text-blue-600",
  "In Progress": "text-purple-600", Resolved: "text-green-600", Rejected: "text-gray-500",
};

const chartData = [
  { name: "Sexual Abuse",   value: 15, color: "#1a2340" },
  { name: "Child Abuse",    value: 22, color: "#3b5bdb" },
  { name: "Physical Abuse", value: 18, color: "#1a2340" },
  { name: "Marriage Abuse", value: 10, color: "#f59e0b" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState("home");
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState(getCases());
  const [filter, setFilter] = useState("All");
  const [notifOpen, setNotifOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("currentUser") || '{"username":"Admin"}');

  useEffect(() => {
    if (!localStorage.getItem("adminAuth")) navigate("/login");

    // Poll for new cases every 15 seconds — no extra package needed
    const poll = setInterval(() => {
      fetchCases().then((d) => {
        if (!Array.isArray(d)) return;
        setCases((prev) => {
          if (d.length > prev.length) setNotifOpen(true);
          return d;
        });
      });
    }, 15000);

    return () => clearInterval(poll);
  }, [navigate]);

  // Refresh cases from API when switching back to home
  useEffect(() => {
    if (activeKey === "home") {
      fetchCases().then((data) => { if (Array.isArray(data)) setCases(data); });
    }
  }, [activeKey]);

  const logout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const criticalCases = cases.filter((c) => c.urgency === "High" && c.status === "Pending");
  const filtered = filter === "All" ? cases : cases.filter((c) => c.urgency === filter);

  const handleViewCase = (id) => {
    setSelectedCase(id);
    setActiveKey("case-detail");
  };

  const renderContent = () => {
    if (activeKey === "case-detail" && selectedCase) {
      return <CaseDetail caseId={selectedCase} onBack={() => { setSelectedCase(null); setActiveKey("cases"); }} />;
    }
    if (activeKey === "reports" || activeKey === "cases") {
      return <CaseList onViewCase={handleViewCase} />;
    }
    if (activeKey === "analytics") return <Analytics />;
    if (activeKey === "activity")  return <ActivityLog />;
    if (activeKey === "settings")  return <SettingsView user={user} />;
    return <HomeView cases={cases} criticalCases={criticalCases} filter={filter} setFilter={setFilter} filtered={filtered} onViewCase={handleViewCase} />;
  };

  return (
    <div className="flex h-screen bg-[#e8edf2] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-52 bg-[#1a2340] flex flex-col text-white shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <FaUserCircle className="text-white text-lg" />
            </div>
            <span className="font-bold text-sm">SafeSpeak</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <button key={item.key} onClick={() => { setActiveKey(item.key); setSelectedCase(null); }}
              className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition ${
                activeKey === item.key || (activeKey === "case-detail" && item.key === "cases")
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.key === "cases" && criticalCases.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {criticalCases.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-white/50">Signed in as</p>
            <p className="text-xs text-white font-semibold truncate">{user.username}</p>
          </div>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#1a2340] text-white px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold">SafeSpeak – Organization Dashboard</h1>
            <p className="text-xs text-white/60">Authorized Access – Women & Children Affairs / Police / Partner NGOs</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-white/80 hover:text-white">
                <FaBell className="text-xl" />
                {criticalCases.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {criticalCases.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-8 w-72 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-xs font-bold text-gray-700">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {criticalCases.length === 0 && (
                      <p className="text-xs text-gray-400 p-4 text-center">No critical alerts</p>
                    )}
                    {criticalCases.map((c) => (
                      <button key={c.caseId} onClick={() => { handleViewCase(c.caseId); setNotifOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 border-b last:border-0">
                        <p className="text-xs font-semibold text-red-600">⚠️ {c.caseId} — {c.classification}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">High urgency · Pending · {c.location}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <FaUserCircle className="text-3xl text-white/80" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

/* ── HOME VIEW ── */
function HomeView({ cases, criticalCases, filter, setFilter, filtered, onViewCase }) {
  const active  = cases.filter((c) => !["Resolved","Rejected"].includes(c.status)).length;
  const closed  = cases.filter((c) => c.status === "Resolved").length;
  const newToday = cases.filter((c) => c.arrival === new Date().toISOString().split("T")[0]).length;

  const chartData = [
    { name: "Sexual Abuse",   value: cases.filter(c=>c.classification==="Sexual Abuse").length,   color: "#1a2340" },
    { name: "Child Abuse",    value: cases.filter(c=>c.classification==="Child Abuse").length,    color: "#3b5bdb" },
    { name: "Physical Abuse", value: cases.filter(c=>c.classification==="Physical Abuse").length, color: "#f59e0b" },
    { name: "Marriage Abuse", value: cases.filter(c=>c.classification==="Marriage Abuse").length, color: "#10b981" },
  ];
  const maxChart = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">WELCOME Back, Organization A</h2>
        <p className="text-sm text-gray-500">Manage your reports and cases securely below</p>
      </div>

      {/* AI Critical Banner */}
      {criticalCases.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-red-500 text-xl animate-pulse">⚠️</span>
          <div>
            <p className="text-sm font-bold text-red-700">
              {criticalCases.length} Critical Case{criticalCases.length > 1 ? "s" : ""} Need Immediate Attention
            </p>
            <p className="text-xs text-red-500">{criticalCases.map(c => c.caseId).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "New Reports",        value: cases.length, sub: "Total",    red: false },
          { label: "Active Cases",       value: active,       sub: "",         red: false },
          { label: "Closed Cases",       value: closed,       sub: "",         red: false },
          { label: "Avg. Response Time", value: "4.2h",       sub: "",         red: false },
          { label: "Critical Cases",     value: criticalCases.length, sub: "", red: true  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.red ? "text-red-500" : "text-gray-800"}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Case Queue */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3">Case Queue</h3>
          <div className="flex items-center gap-2 mb-4">
            {["All","High","Medium","Low"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${filter === f ? "bg-[#1a2340] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  {["Case ID","Arrival","Classification","Urgency","Location","Assigned Org","Officer","Status",""].map(h => (
                    <th key={h} className="text-left pb-2 pr-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.caseId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-3 font-medium text-gray-700">{c.caseId}</td>
                    <td className="py-2 pr-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-3 text-gray-700">{c.classification}</td>
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${urgencyDot[c.urgency]}`} />{c.urgency}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-500">{c.location}</td>
                    <td className="py-2 pr-3 text-gray-500">{c.org}</td>
                    <td className="py-2 pr-3 text-gray-500">{c.officer}</td>
                    <td className={`py-2 pr-3 font-medium ${statusColor[c.status]}`}>{c.status}</td>
                    <td className="py-2">
                      <button onClick={() => onViewCase(c.caseId)} className="text-blue-500 hover:underline whitespace-nowrap">
                        view case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Case Classification Overview</h3>
            <div className="flex items-end gap-3 h-32">
              {chartData.map((d) => (
                <div key={d.name} className="flex flex-col items-center flex-1 h-full justify-end">
                  <div className="w-full rounded-t-md transition-all"
                    style={{ height: `${(d.value / maxChart) * 100}%`, backgroundColor: d.color }} />
                  <span className="text-[9px] text-gray-500 mt-1 text-center leading-tight">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Alerts</h3>
            <div className="space-y-2">
              {criticalCases.slice(0, 3).map((c) => (
                <button key={c.caseId} onClick={() => onViewCase(c.caseId)}
                  className="w-full flex items-center gap-2 text-xs text-left hover:bg-red-50 rounded-lg p-1.5 transition">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                  <span className="text-red-600 font-medium">{c.caseId} — {c.classification}</span>
                </button>
              ))}
              {criticalCases.length === 0 && (
                <p className="text-xs text-gray-400">No critical alerts</p>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 italic">*All suggestions reviewed by authorized personnel</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SETTINGS VIEW ── */
function SettingsView({ user }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500">Account and system configuration</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">Account Info</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Username</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Role</span>
            <span className="font-medium capitalize">{user.role || "admin"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Organization</span>
            <span className="font-medium">Organization A</span>
          </div>
        </div>
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 font-medium">To add new admin accounts, visit:</p>
          <p className="text-xs text-blue-500 mt-0.5 font-mono">/admin/register</p>
        </div>
      </div>
    </div>
  );
}
