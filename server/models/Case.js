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

  reporterEmail:  { type: String, default: "" },
  reporterUserId: { type: String, default: "" }, // linked to User._id

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
}, { timestamps: true });

// Auto-generate caseId before first save
caseSchema.pre("save", async function (next) {
  if (this.caseId) return next();
  const count = await mongoose.model("Case").countDocuments();
  this.caseId = `CASE-${1000 + count + 1}`;
  next();
});

module.exports = mongoose.model("Case", caseSchema);
