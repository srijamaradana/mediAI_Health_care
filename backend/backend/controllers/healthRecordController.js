const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const HealthRecord = require("../models/HealthRecord");

// @route POST /api/health-records
const addRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.create({ ...req.body, patient: req.user._id });
  res.status(201).json({ success: true, data: { record } });
});

// @route GET /api/health-records
const getRecords = asyncHandler(async (req, res) => {
  const { type, patientId, from, to } = req.query;
  const query = {};

  if (req.user.role === "patient") {
    query.patient = req.user._id;
  } else if (patientId) {
    query.patient = patientId; // doctor/admin viewing a specific patient's records
  } else {
    throw new ApiError(400, "patientId is required for non-patient roles");
  }

  if (type) query.type = type;
  if (from || to) {
    query.recordedAt = {};
    if (from) query.recordedAt.$gte = new Date(from);
    if (to) query.recordedAt.$lte = new Date(to);
  }

  const records = await HealthRecord.find(query).sort({ recordedAt: -1 });
  res.status(200).json({ success: true, data: { records } });
});

// @route DELETE /api/health-records/:id
const deleteRecord = asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);
  if (!record) throw new ApiError(404, "Record not found");
  if (!record.patient.equals(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to delete this record");
  }
  await record.deleteOne();
  res.status(200).json({ success: true, message: "Record deleted" });
});

module.exports = { addRecord, getRecords, deleteRecord };
