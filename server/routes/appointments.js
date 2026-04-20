const router = require("express").Router();
const Appointment = require("../models/Appointment");
const Case = require("../models/Case");
const { protect, adminOnly } = require("../middleware/auth");
const { sendAppointmentEmail } = require("../config/mailer");

// POST /api/appointments — admin schedules appointment
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { caseId, date, time, location, notes } = req.body;
    const c = await Case.findOne({ caseId });
    if (!c) return res.status(404).json({ message: "Case not found" });
    if (!c.reporterEmail) return res.status(400).json({ message: "No email on file for this reporter" });

    const appt = await Appointment.create({ caseId, reporterEmail: c.reporterEmail, date, time, location, notes: notes || "" });

    try {
      await sendAppointmentEmail(c.reporterEmail, appt, caseId);
      await Appointment.findByIdAndUpdate(appt._id, { notified: true });
    } catch (e) { console.warn("Email failed:", e.message); }

    res.status(201).json({ message: "Appointment scheduled", appointment: appt });
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

// PATCH /api/appointments/:id — update status
router.patch("/:id", protect, adminOnly, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(appt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
