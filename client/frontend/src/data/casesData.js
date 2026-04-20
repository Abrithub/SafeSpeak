// Central case store — simulates a backend database via localStorage

export const INITIAL_CASES = [
  {
    id: "CASE-1234", arrival: "2025-12-02", classification: "Sexual Abuse",
    urgency: "High", location: "District1", org: "Zone 1 Police", officer: "PO-214",
    status: "Pending", description: "Victim reported repeated sexual abuse by a family member over 6 months. Victim is 13 years old.",
    aiScore: 97, aiReason: "High-frequency abuse, minor victim, known perpetrator — immediate intervention required.",
    evidence: [], notes: [], messages: [], reportedAt: "2025-12-02T08:14:00",
  },
  {
    id: "CASE-1235", arrival: "2025-12-01", classification: "Child Abuse",
    urgency: "High", location: "District2", org: "Women Affair", officer: "WA-215",
    status: "Under Review", description: "Child found with bruises at school. Teacher reported suspected physical abuse at home.",
    aiScore: 91, aiReason: "Physical evidence present, school-reported, child at immediate risk.",
    evidence: [], notes: [{ author: "WA-215", text: "Contacted school principal for statement.", time: "2025-12-01T10:30:00" }],
    messages: [], reportedAt: "2025-12-01T07:45:00",
  },
  {
    id: "CASE-1236", arrival: "2025-11-25", classification: "Marriage Abuse",
    urgency: "Medium", location: "District3", org: "Zone 3 Police", officer: "PO-216",
    status: "In Progress", description: "Spouse reported domestic violence. Victim has been hospitalized twice in the past month.",
    aiScore: 74, aiReason: "Recurring domestic violence, hospitalization history — escalation risk.",
    evidence: [], notes: [], messages: [], reportedAt: "2025-11-25T14:20:00",
  },
  {
    id: "CASE-1237", arrival: "2025-11-21", classification: "Physical Abuse",
    urgency: "Medium", location: "District4", org: "Zone 4 Police", officer: "PO-204",
    status: "Resolved", description: "Adult victim reported assault by neighbor. Medical report submitted.",
    aiScore: 62, aiReason: "Single incident, adult victim, medical evidence available.",
    evidence: [], notes: [{ author: "PO-204", text: "Case resolved. Perpetrator arrested.", time: "2025-11-23T09:00:00" }],
    messages: [], reportedAt: "2025-11-21T16:10:00",
  },
  {
    id: "CASE-1238", arrival: "2025-11-17", classification: "Emotional Abuse",
    urgency: "Low", location: "District5", org: "Zone 5 Police", officer: "PO-211",
    status: "Pending", description: "Victim reports prolonged emotional manipulation and isolation by partner.",
    aiScore: 45, aiReason: "No physical evidence, self-reported — requires follow-up assessment.",
    evidence: [], notes: [], messages: [], reportedAt: "2025-11-17T11:05:00",
  },
  {
    id: "CASE-1239", arrival: "2025-11-12", classification: "Gender Abuse",
    urgency: "Low", location: "District6", org: "Zone 6 Police", officer: "PO-200",
    status: "Resolved", description: "Workplace gender-based harassment reported. HR investigation completed.",
    aiScore: 38, aiReason: "Workplace context, HR involved, low immediate risk.",
    evidence: [], notes: [], messages: [], reportedAt: "2025-11-12T09:30:00",
  },
  {
    id: "CASE-1240", arrival: "2025-12-03", classification: "Sexual Abuse",
    urgency: "High", location: "District1", org: "Zone 1 Police", officer: "PO-214",
    status: "Pending", description: "Second report from District1 involving similar description of perpetrator as CASE-1234.",
    aiScore: 99, aiReason: "⚠️ Pattern detected: Same location and perpetrator description as CASE-1234. Likely serial offender.",
    evidence: [], notes: [], messages: [], reportedAt: "2025-12-03T06:50:00",
  },
];

export const getCases = () => {
  const stored = localStorage.getItem("ss_cases");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("ss_cases", JSON.stringify(INITIAL_CASES));
  return INITIAL_CASES;
};

export const saveCases = (cases) => localStorage.setItem("ss_cases", JSON.stringify(cases));

export const updateCase = (id, updates) => {
  const cases = getCases();
  const idx = cases.findIndex((c) => c.id === id);
  if (idx === -1) return;
  cases[idx] = { ...cases[idx], ...updates };
  saveCases(cases);
  return cases[idx];
};
