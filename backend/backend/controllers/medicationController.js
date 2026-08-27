const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Medication = require("../models/Medication");

// @route POST /api/medications
const addMedication = asyncHandler(async (req, res) => {
  const patientId = req.user.role === "patient" ? req.user._id : req.body.patient;
  if (!patientId) throw new ApiError(400, "patient is required");

  const medication = await Medication.create({ ...req.body, patient: patientId });
  res.status(201).json({ success: true, data: { medication } });
});

// @route GET /api/medications
const getMedications = asyncHandler(async (req, res) => {
  const query = req.user.role === "patient" ? { patient: req.user._id } : {};
  if (req.query.patientId) query.patient = req.query.patientId;
  if (req.query.active === "true") query.isActive = true;

  const medications = await Medication.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { medications } });
});

// @route PUT /api/medications/:id
const updateMedication = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);
  if (!medication) throw new ApiError(404, "Medication not found");
  if (req.user.role === "patient" && !medication.patient.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized to update this medication");
  }
  Object.assign(medication, req.body);
  await medication.save();
  res.status(200).json({ success: true, data: { medication } });
});

// @route POST /api/medications/:id/log  (mark a dose taken/missed/skipped)
const logDose = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const medication = await Medication.findById(req.params.id);
  if (!medication) throw new ApiError(404, "Medication not found");
  if (!medication.patient.equals(req.user._id)) throw new ApiError(403, "Not authorized");

  medication.logs.push({ status, takenAt: new Date() });
  await medication.save();
  res.status(200).json({ success: true, data: { medication } });
});

// @route DELETE /api/medications/:id
const deleteMedication = asyncHandler(async (req, res) => {
  const medication = await Medication.findById(req.params.id);
  if (!medication) throw new ApiError(404, "Medication not found");
  if (req.user.role === "patient" && !medication.patient.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized to delete this medication");
  }
  await medication.deleteOne();
  res.status(200).json({ success: true, message: "Medication removed" });
});

module.exports = { addMedication, getMedications, updateMedication, logDose, deleteMedication };
