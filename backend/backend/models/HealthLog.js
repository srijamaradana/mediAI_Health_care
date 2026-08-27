const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    vitals: {
      bloodPressureSystolic: Number,
      bloodPressureDiastolic: Number,
      heartRate: Number, // bpm
      bloodSugar: Number, // mg/dL
      weight: Number, // kg
      temperature: Number, // Celsius
      spo2: Number, // %
    },
    symptoms: [{ type: String }],
    mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
    sleepHours: Number,
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

healthLogSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);
