const router = require("express").Router();
const Case = require("../models/Case");
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { sendStatusUpdateEmail } = require("../config/mailer");

const AI_SERVICE = process.env.AI_SERVICE_URL || "http://localhost:5001";

// Call the AI microservice; fall back to rule-based if it's unreachable
const aiClassify = async (data) => {
  const abuseTypes = Array.isArray(data.abuseTypes)
    ? data.abuseTypes
    : data.abuseTypes ? [data.abuseTypes] : [];

  try {
    const res = await fetch(`${AI_SERVICE}/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: data.description || "",
        abuseTypes,
        isVictimSafe: data.isVictimSafe || "",
      }),
      signal: AbortSignal.timeout(3000), // 3s timeout
    });
    if (!res.ok) throw new Error("AI service error");
    const result = await res.json();
    return {
      aiScore:        result.aiScore        || 30,
      aiReason:       result.aiReason       || "",
      urgency:        result.urgency        || "Low",
      classification: result.classification || abuseTypes[0] || "Unclassified",
    };
  } catch (_) {
    // Fallback: simple rule-based
    const score = abuseTypes.includes("Sexual") ? 75
      : abuseTypes.includes("Human trafficking concerns") ? 80
      : abuseTypes.includes("Physical") ? 60
      : 30;
    return {
      aiScore: score,
      aiReason: "Classified by fallback engine.",
      urgency: score >= 75 ? "High" : score >= 50 ? "Medium" : "Low",
      classification: abuseTypes[0] || "Unclassified",
    };
  }
};

// POST /api/cases  — submit a new report with optional file uploads (public or authenticated)
router.post("/", upload.array("evidence", 5), async (req, res) => {
  try {
    const ai = await aiClassify(req.body);
    const evidenceFiles = (req.files || []).map((f) => ({
      url: f.path, publicId: f.filename, type: f.mimetype,
    }));

    // If reporter is logged in, attach their userId and email
    let reporterUserId = "";
    let reporterEmail = req.body.reporterEmail || "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        if (decoded.role === "reporter") {
          reporterUserId = decoded.id;
          // Get email from user record if not provided
          if (!reporterEmail) {
            const User = require("../models/User");
            const user = await User.findById(decoded.id).select("email");
            if (user?.email) reporterEmail = user.email;
          }
        }
      } catch (_) {}
    }

    const newCase = await Case.create({
      ...req.body, ...ai, evidence: evidenceFiles,
      reporterUserId, reporterEmail,
    });

    // Emit real-time notification to all connected admins
    req.io.emit("new_case", {
      caseId: newCase.caseId,
      classification: newCase.classification,
      urgency: newCase.urgency,
      location: newCase.location,
    });
    res.status(201).json({ message: "Report submitted successfully", caseId: newCase.caseId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cases/track/:caseId  — public case status lookup by caseId + email
router.get("/track/:caseId", async (req, res) => {
  try {
    const { email } = req.query;
    const c = await Case.findOne({ caseId: req.params.caseId })
      .select("caseId status classification urgency createdAt messages reporterEmail");
    if (!c) return res.status(404).json({ message: "Case not found. Check your Case ID." });

    // If email provided, verify it matches
    if (email && c.reporterEmail && c.reporterEmail.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: "Email does not match this case." });
    }

    // Get appointments for this case
    const Appointment = require("../models/Appointment");
    const appointments = await Appointment.find({ caseId: req.params.caseId })
      .select("date time location notes status createdAt");

    res.json({
      caseId: c.caseId,
      status: c.status,
      classification: c.classification,
      urgency: c.urgency,
      submittedAt: c.createdAt,
      messages: (c.messages || []).filter((m) => m.from === "admin").map((m) => ({
        text: m.text, time: m.createdAt,
      })),
      appointments,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/cases/mine — reporter fetches their own cases (JWT required)
router.get("/mine", protect, async (req, res) => {
  try {
    // Find by userId OR by email (catches cases submitted before account existed)
    const query = { $or: [{ reporterUserId: req.user.id }] };
    if (req.user.email) query.$or.push({ reporterEmail: req.user.email });

    const cases = await Case.find(query)
      .select("caseId status classification urgency createdAt messages reporterEmail")
      .sort({ createdAt: -1 });

    const Appointment = require("../models/Appointment");
    const result = await Promise.all(cases.map(async (c) => {
      const appointments = await Appointment.find({ caseId: c.caseId })
        .select("date time location notes status createdAt");
      return { ...c.toObject(), appointments };
    }));

    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get("/stats/overview", protect, adminOnly, async (req, res) => {
  try {
    const total     = await Case.countDocuments();
    const critical  = await Case.countDocuments({ urgency: "High", status: "Pending" });
    const resolved  = await Case.countDocuments({ status: "Resolved" });
    const pending   = await Case.countDocuments({ status: "Pending" });
    const byType    = await Case.aggregate([{ $group: { _id: "$classification", count: { $sum: 1 } } }]);
    const byUrgency = await Case.aggregate([{ $group: { _id: "$urgency", count: { $sum: 1 } } }]);
    const byStatus  = await Case.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const byLocation= await Case.aggregate([{ $group: { _id: "$location", count: { $sum: 1 } } }]);
    res.json({ total, critical, resolved, pending, byType, byUrgency, byStatus, byLocation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cases  — list all cases (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { urgency, status, classification, search } = req.query;
    const filter = {};
    if (urgency && urgency !== "All") filter.urgency = urgency;
    if (status && status !== "All") filter.status = status;
    if (classification && classification !== "All") filter.classification = classification;
    if (search) {
      filter.$or = [
        { caseId: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { classification: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    const cases = await Case.find(filter).sort({ aiScore: -1, createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cases/:id  — single case detail (admin only)
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const c = await Case.findOne({ caseId: req.params.id });
    if (!c) return res.status(404).json({ message: "Case not found" });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/cases/:id/status  — update status + email reporter
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const c = await Case.findOneAndUpdate({ caseId: req.params.id }, { status }, { new: true });
    if (!c) return res.status(404).json({ message: "Case not found" });

    // Email reporter if they have an email on file
    if (c.reporterEmail) {
      try { await sendStatusUpdateEmail(c.reporterEmail, c.caseId, status); } catch (e) { console.warn("Email failed:", e.message); }
    }

    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/cases/:id/assign — assign officer + org (admin only)
router.patch("/:id/assign", protect, adminOnly, async (req, res) => {
  try {
    const { officer, org } = req.body;
    const c = await Case.findOneAndUpdate(
      { caseId: req.params.id },
      { ...(officer && { officer }), ...(org && { org }) },
      { new: true }
    );
    if (!c) return res.status(404).json({ message: "Case not found" });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/cases/:id/reopen — reopen a resolved/rejected case (admin only)
router.patch("/:id/reopen", protect, adminOnly, async (req, res) => {
  try {
    const c = await Case.findOneAndUpdate(
      { caseId: req.params.id },
      { status: "Under Review" },
      { new: true }
    );
    if (!c) return res.status(404).json({ message: "Case not found" });
    if (c.reporterEmail) {
      try { await sendStatusUpdateEmail(c.reporterEmail, c.caseId, "Under Review (Reopened)"); } catch (e) {}
    }
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/cases/:id/archive — archive a case (admin only)
router.patch("/:id/archive", protect, adminOnly, async (req, res) => {
  try {
    const c = await Case.findOneAndUpdate(
      { caseId: req.params.id },
      { status: "Archived" },
      { new: true }
    );
    if (!c) return res.status(404).json({ message: "Case not found" });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/cases/:id/messages/reporter — reporter replies to admin message
router.post("/:id/messages/reporter", protect, async (req, res) => {
  try {
    const { text } = req.body;
    const c = await Case.findOne({ caseId: req.params.id });
    if (!c) return res.status(404).json({ message: "Case not found" });
    // Only allow if this reporter owns the case
    if (c.reporterUserId && c.reporterUserId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    c.messages.push({ from: "reporter", text });
    await c.save();
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/cases/bulk/status — bulk status update (admin only)
router.patch("/bulk/status", protect, adminOnly, async (req, res) => {
  try {
    const { caseIds, status } = req.body;
    if (!Array.isArray(caseIds) || !status) return res.status(400).json({ message: "caseIds and status required" });
    await Case.updateMany({ caseId: { $in: caseIds } }, { status });
    res.json({ message: `${caseIds.length} cases updated to ${status}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/cases/:id/notes  — add internal note (admin only)
router.post("/:id/notes", protect, adminOnly, async (req, res) => {
  try {
    const { text } = req.body;
    const c = await Case.findOne({ caseId: req.params.id });
    if (!c) return res.status(404).json({ message: "Case not found" });
    c.notes.push({ author: req.user.username, text });
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cases/:id/messages  — send message to reporter (admin only)
router.post("/:id/messages", protect, adminOnly, async (req, res) => {
  try {
    const { text } = req.body;
    const c = await Case.findOne({ caseId: req.params.id });
    if (!c) return res.status(404).json({ message: "Case not found" });
    c.messages.push({ from: "admin", text });
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
