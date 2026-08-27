const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // "500mg"
    frequency: { type: String, required: true }, // "Twice a day"
    times: [{ type: String }], // ["08:00", "20:00"]
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    instructions: { type: String },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    isActive: { type: Boolean, default: true },
    reminderEnabled: { type: Boolean, default: true },
    logs: [
      {
        takenAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["taken", "missed", "skipped"], default: "taken" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
