const HealthLog = require('../models/HealthLog');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/health-logs
const addHealthLog = asyncHandler(async (req, res) => {
  const log = await HealthLog.create({ ...req.body, patient: req.user._id });
  res.status(201).json({ success: true, message: 'Health log recorded', log });
});

// @route GET /api/health-logs/me?days=30
const getMyHealthLogs = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  const logs = await HealthLog.find({ patient: req.user._id, date: { $gte: since } }).sort({ date: 1 });
  res.json({ success: true, logs });
});

// @route GET /api/health-logs/patient/:patientId (doctor view)
const getPatientHealthLogs = asyncHandler(async (req, res) => {
  const { days = 90 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  const logs = await HealthLog.find({ patient: req.params.patientId, date: { $gte: since } }).sort({ date: 1 });
  res.json({ success: true, logs });
});

module.exports = { addHealthLog, getMyHealthLogs, getPatientHealthLogs };
