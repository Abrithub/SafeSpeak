const router = require("express").Router();
const Appointment = require("../models/Appointment");
const Case = require("../models/Case");
const { protect, adminOnly } = require("../middleware/auth");
const { sendAppointmentEmail, sendOutcomeEmail } = require("../config/mailer");

// POST /api/appointments — admin schedules appointment
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      caseId, type, date, time, location,
      stationName, officerName, officerPhone,
      courtName, courtRoom, judge,
      purpose, notes,
    } = req.body;

    const c = await Case.findOne({ caseId });
    if (!c) return res.status(404).json({ message: "Case not found" });

    const appt = await Appointment.create({
      caseId,
      reporterEmail:  c.reporterEmail  || "",
      reporterUserId: c.reporterUserId || "",
      type: type || "police_station",
      date, time, location,
      stationName: stationName || "",
      officerName:  officerName  || "",
      officerPhone: officerPhone || "",
      courtName:  courtName  || "",
      courtRoom:  courtRoom  || "",
      judge:      judge      || "",
      purpose: purpose || "",
      notes:   notes   || "",
    });

    // Build a rich message for the case timeline
    const typeLabel = type === "court" ? "⚖️ Court Appointment"
      : type === "safespeak_office" ? "🏢 Office Appointment"
      : "🚔 Police Station Appointment";

    let msgText = `${typeLabel} Scheduled\n📅 Date: ${date}\n🕐 Time: ${time}\n📍 Location: ${location}`;
    if (stationName)  msgText += `\n🏢 Station: ${stationName}`;
    if (officerName)  msgText += `\n👮 Officer: ${officerName}`;
    if (officerPhone) msgText += `\n📞 Officer Phone: ${officerPhone}`;
    if (courtName)    msgText += `\n⚖️ Court: ${courtName}`;
    if (courtRoom)    msgText += `\n🚪 Room: ${courtRoom}`;
    if (judge)        msgText += `\n👨‍⚖️ Judge: ${judge}`;
    if (purpose)      msgText += `\n\n📋 What to bring:\n${purpose}`;

    c.messages.push({ from: "admin", text: msgText });
    await c.save();

    // Email reporter
    if (c.reporterEmail) {
      try {
        await sendAppointmentEmail(c.reporterEmail, appt, caseId);
        await Appointment.findByIdAndUpdate(appt._id, { notified: true });
      } catch (e) { console.warn("Email failed:", e.message); }
    }

    res.status(201).json({ message: "Appointment scheduled", appointment: appt });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/appointments/:id/outcome — record outcome after appointment
router.patch("/:id/outcome", protect, adminOnly, async (req, res) => {
  try {
    const { outcome, outcomeNote } = req.body;
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { outcome, outcomeNote: outcomeNote || "", status: "Completed" },
      { new: true }
    );
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // Update case status based on outcome
    const statusMap = {
      resolved:         "Resolved",
      proceed_to_court: "In Progress",
      needs_more_info:  "Under Review",
      dismissed:        "Rejected",
    };
    const newStatus = statusMap[outcome];
    if (newStatus) {
      await Case.findOneAndUpdate({ caseId: appt.caseId }, { status: newStatus });
    }

    // Add outcome message to case
    const outcomeLabels = {
      resolved:         "✅ Case Resolved",
      proceed_to_court: "⚖️ Proceeding to Court",
      needs_more_info:  "📋 Additional Information Required",
      dismissed:        "❌ Case Dismissed",
    };
    const c = await Case.findOne({ caseId: appt.caseId });
    if (c) {
      c.messages.push({
        from: "admin",
        text: `${outcomeLabels[outcome] || "Appointment Completed"}${outcomeNote ? `\n\n${outcomeNote}` : ""}`,
      });
      await c.save();

      // Email reporter about outcome
      if (c.reporterEmail) {
        try { await sendOutcomeEmail(c.reporterEmail, appt.caseId, outcome, outcomeNote); } catch (e) {}
      }
    }

    res.json(appt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/appointments/case/:caseId — admin views appointments for a case
router.get("/case/:caseId", protect, adminOnly, async (req, res) => {
  try {
    const appts = await Appointment.find({ caseId: req.params.caseId }).sort({ createdAt: -1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/appointments/reporter/:email — reporter views their appointments
router.get("/reporter/:email", async (req, res) => {
  try {
    const appts = await Appointment.find({ reporterEmail: req.params.email }).sort({ date: 1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/appointments/mine — reporter views their appointments by JWT
router.get("/mine", protect, async (req, res) => {
  try {
    const query = { $or: [{ reporterUserId: req.user.id }] };
    if (req.user.email) query.$or.push({ reporterEmail: req.user.email });
    const appts = await Appointment.find(query).sort({ date: 1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/appointments/:id — update status
router.patch("/:id", protect, adminOnly, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(appt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
