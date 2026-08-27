const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// @route GET /api/doctors  (public/patients browse doctors)
const getDoctors = asyncHandler(async (req, res) => {
  const { specialization, search, page = 1, limit = 20 } = req.query;
  const query = { isApproved: true };
  if (specialization) query.specialization = { $regex: specialization, $options: "i" };

  let doctorsQuery = Doctor.find(query)
    .populate("user", "name email phone avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  let doctors = await doctorsQuery;

  if (search) {
    const term = search.toLowerCase();
    doctors = doctors.filter((d) => d.user.name.toLowerCase().includes(term));
  }

  const total = await Doctor.countDocuments(query);
  res.status(200).json({ success: true, data: { doctors, total } });
});

// @route GET /api/doctors/:id
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("user", "name email phone avatar");
  if (!doctor) throw new ApiError(404, "Doctor not found");
  res.status(200).json({ success: true, data: { doctor } });
});

// @route PUT /api/doctors/profile  (doctor updates own profile)
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const allowed = ["specialization", "qualifications", "experienceYears", "consultationFee", "bio", "availability"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) doctor[field] = req.body[field];
  });
  await doctor.save();
  res.status(200).json({ success: true, data: { doctor } });
});

// @route GET /api/doctors/:id/availability?date=YYYY-MM-DD
const getAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw new ApiError(400, "date query param is required");

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
  const daySlots = doctor.availability.find((a) => a.day === dayName);
  if (!daySlots) return res.status(200).json({ success: true, data: { slots: [] } });

  // Generate 30-min slots between start and end time
  const slots = [];
  let [h, m] = daySlots.startTime.split(":").map(Number);
  const [endH, endM] = daySlots.endTime.split(":").map(Number);
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) { m -= 60; h += 1; }
  }

  const booked = await Appointment.find({
    doctor: doctor._id,
    date: new Date(date),
    status: { $in: ["pending", "confirmed"] },
  }).select("timeSlot");
  const bookedSlots = new Set(booked.map((b) => b.timeSlot.split("-")[0]));

  const availableSlots = slots.filter((s) => !bookedSlots.has(s));
  res.status(200).json({ success: true, data: { slots: availableSlots } });
});

// @route PUT /api/doctors/:id/approve  (admin only)
const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!doctor) throw new ApiError(404, "Doctor not found");
  res.status(200).json({ success: true, data: { doctor } });
});

module.exports = { getDoctors, getDoctorById, updateDoctorProfile, getAvailability, approveDoctor };
