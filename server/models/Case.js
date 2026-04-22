const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  author:  { type: String, required: true },
  text:    { type: String, required: true },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  from:    { type: String, enum: ["admin", "reporter"], required: true },
  text:    { type: String, required: true },
}, { timestamps: true });

const caseSchema = new mongoose.Schema({
  // Auto-generated case ID like CASE-1001
  caseId:         { type: String, unique: true },

  reporterEmail:  { type: String, default: "", index: true },
  reporterUserId: { type: String, default: "", index: true }, // linked to User._id

  // Reporter info
  reportingFor:   { type: String },
  relationship:   { type: String },
  reporterName:   { type: String },
  phone:          { type: String },
  contactMethod:  { type: String },

  // Victim info
  ageRange:       { type: String },
  gender:         { type: String },
  locationTypeOfIncident: { type: String },

  // Incident
  abuseTypes:     [{ type: String }],
  whenDidItHappen:{ type: String },
  isVictimSafe:   { type: String },
  description:    { type: String, default: "" },

  // AI classification
  classification: { type: String, default: "Unclassified" },
  urgency:        { type: String, enum: ["High", "Medium", "Low"], default: "Low" },
  aiScore:        { type: Number, default: 0 },
  aiReason:       { type: String, default: "" },

  // Case management
  status: {
    type: String,
    enum: ["Pending", "Under Review", "In Progress", "Resolved", "Rejected", "Archived"],
    default: "Pending",
    index: true,
  },
  location:  { type: String, default: "Unknown" },
  org:       { type: String, default: "Unassigned" },
  officer:   { type: String, default: "Unassigned" },

  notes:    [noteSchema],
  messages: [messageSchema],
  evidence: [{
    url:      { type: String },
    publicId: { type: String },
    type:     { type: String },
  }],

  // Referral — where the case was sent
  referral: {
    type:            { type: String, enum: ["police", "court", "info_request", null], default: null },
    // Police fields
    stationName:     { type: String, default: "" },
    stationAddress:  { type: String, default: "" },
    officerName:     { type: String, default: "" },
    officerPhone:    { type: String, default: "" },
    // Court fields
    courtName:       { type: String, default: "" },
    courtDate:       { type: String, default: "" },
    courtTime:       { type: String, default: "" },
    courtRoom:       { type: String, default: "" },
    judge:           { type: String, default: "" },
    // Info request fields
    infoRequest:     { type: String, default: "" },
    infoDeadline:    { type: String, default: "" },
    // Common
    referralNote:    { type: String, default: "" },
    referredAt:      { type: Date },
    referredBy:      { type: String, default: "" },
  },
}, { timestamps: true });

// Auto-generate caseId before first save
caseSchema.pre("save", async function (next) {
  if (this.caseId) return next();
  const count = await mongoose.model("Case").countDocuments();
  this.caseId = `CASE-${1000 + count + 1}`;
  next();
});

module.exports = mongoose.model("Case", caseSchema);
