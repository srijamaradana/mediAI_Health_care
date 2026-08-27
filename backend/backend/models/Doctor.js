const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: true,
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    licenseNumber: { type: String, required: true, unique: true },
    consultationFee: { type: Number, default: 0 },
    bio: { type: String },
    availability: [availabilitySchema],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false }, // admin approves doctors
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
