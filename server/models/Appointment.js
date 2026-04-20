const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  caseId:      { type: String, required: true },
  reporterEmail: { type: String, required: true },
  date:        { type: String, required: true }, // e.g. "2025-12-15"
  time:        { type: String, required: true }, // e.g. "10:00 AM"
  location:    { type: String, required: true }, // physical address or office
  notes:       { type: String, default: "" },
  status:      { type: String, enum: ["Scheduled", "Confirmed", "Cancelled", "Completed"], default: "Scheduled" },
  notified:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
