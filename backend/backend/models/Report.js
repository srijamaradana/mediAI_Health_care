const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["lab_report", "scan", "prescription", "discharge_summary", "other"], default: "other" },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
