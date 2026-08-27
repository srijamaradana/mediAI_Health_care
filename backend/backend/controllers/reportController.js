const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Report = require("../models/Report");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// Uploads a buffer to Cloudinary using an upload_stream
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder, resource_type: "auto" }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

// @route POST /api/reports  (multipart/form-data, field name: file)
const uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");
  const { title, type, notes, patientId } = req.body;

  const result = await uploadToCloudinary(req.file.buffer, "mediai/reports");

  const report = await Report.create({
    patient: req.user.role === "patient" ? req.user._id : patientId,
    title,
    type,
    notes,
    fileUrl: result.secure_url,
    filePublicId: result.public_id,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { report } });
});

// @route GET /api/reports
const getReports = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === "patient") {
    query.patient = req.user._id;
  } else if (req.query.patientId) {
    query.patient = req.query.patientId;
  }
  const reports = await Report.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { reports } });
});

// @route DELETE /api/reports/:id
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");
  if (!report.patient.equals(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to delete this report");
  }
  if (report.filePublicId) {
    await cloudinary.uploader.destroy(report.filePublicId).catch(() => {});
  }
  await report.deleteOne();
  res.status(200).json({ success: true, message: "Report deleted" });
});

module.exports = { uploadReport, getReports, deleteReport };
