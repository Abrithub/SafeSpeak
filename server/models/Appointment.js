const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  caseId:         { type: String, required: true },
  reporterEmail:  { type: String, default: "" },
  reporterUserId: { type: String, default: "" },

  // Type of appointment
  type: {
    type: String,
    enum: ["police_station", "court", "safespeak_office", "other"],
    default: "police_station",
  },

  // Schedule
  date:     { type: String, required: true },
  time:     { type: String, required: true },
  location: { type: String, required: true },

  // Police station details
  stationName:   { type: String, default: "" },
  officerName:   { type: String, default: "" },
  officerPhone:  { type: String, default: "" },

  // Court details
  courtName:  { type: String, default: "" },
  courtRoom:  { type: String, default: "" },
  judge:      { type: String, default: "" },

  // Purpose / instructions
  purpose:    { type: String, default: "" }, // what to bring, what to expect
  notes:      { type: String, default: "" }, // admin internal notes

  // Outcome after appointment
  outcome: {
    type: String,
    enum: ["pending", "resolved", "proceed_to_court", "needs_more_info", "dismissed"],
    default: "pending",
  },
  outcomeNote: { type: String, default: "" }, // explanation of outcome

  status:   { type: String, enum: ["Scheduled", "Confirmed", "Cancelled", "Completed"], default: "Scheduled" },
  notified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
