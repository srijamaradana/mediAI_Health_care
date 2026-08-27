const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["blood_pressure", "blood_sugar", "weight", "heart_rate", "temperature", "oxygen_level", "other"],
      required: true,
    },
    value: { type: String, required: true }, // e.g. "120/80", "98.6"
    unit: { type: String },
    recordedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
