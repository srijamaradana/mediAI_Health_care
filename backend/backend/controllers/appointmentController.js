const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

const notifyAndEmit = async (recipientId, { type, title, message, relatedId }) => {
  const notification = await Notification.create({ recipient: recipientId, type, title, message, relatedId });
  emitToUser(recipientId.toString(), "notification:new", notification);
  return notification;
};

// @route POST /api/appointments  (patient books)
const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isApproved) throw new ApiError(404, "Doctor not available for booking");

  const conflict = await Appointment.findOne({
    doctor: doctorId,
    date,
    timeSlot,
    status: { $in: ["pending", "confirmed"] },
  });
  if (conflict) throw new ApiError(409, "This time slot is already booked");

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    date,
    timeSlot,
    reason,
  });

  await notifyAndEmit(doctor.user, {
    type: "appointment",
    title: "New appointment request",
    message: `${req.user.name} requested an appointment on ${new Date(date).toDateString()} at ${timeSlot}`,
    relatedId: appointment._id,
  });

  res.status(201).json({ success: true, data: { appointment } });
});

// @route GET /api/appointments  (role-aware listing)
const getAppointments = asyncHandler(async (req, res) => {
  const { status, from, to, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === "patient") {
    query.patient = req.user._id;
  } else if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(404, "Doctor profile not found");
    query.doctor = doctor._id;
  }
  // admin sees all

  if (status) query.status = status;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "name email phone avatar")
    .populate({ path: "doctor", populate: { path: "user", select: "name email avatar" } })
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Appointment.countDocuments(query);
  res.status(200).json({ success: true, data: { appointments, total } });
});

// @route PUT /api/appointments/:id/status  (doctor confirms/completes, either party cancels)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;
  const validStatuses = ["confirmed", "completed", "cancelled", "rescheduled"];
  if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid status");

  const appointment = await Appointment.findById(req.params.id).populate({
    path: "doctor",
    populate: { path: "user" },
  });
  if (!appointment) throw new ApiError(404, "Appointment not found");

  const isDoctor = req.user.role === "doctor" && appointment.doctor.user._id.equals(req.user._id);
  const isPatient = req.user.role === "patient" && appointment.patient.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isDoctor && !isPatient && !isAdmin) throw new ApiError(403, "Not authorized to modify this appointment");
  if (status !== "cancelled" && !isDoctor && !isAdmin) {
    throw new ApiError(403, "Only the doctor can confirm or complete an appointment");
  }

  appointment.status = status;
  if (status === "cancelled") {
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = cancellationReason;
  }
  await appointment.save();

  const recipientId = isDoctor ? appointment.patient : appointment.doctor.user._id;
  await notifyAndEmit(recipientId, {
    type: "appointment",
    title: `Appointment ${status}`,
    message: `Your appointment on ${appointment.date.toDateString()} at ${appointment.timeSlot} is now ${status}`,
    relatedId: appointment._id,
  });

  res.status(200).json({ success: true, data: { appointment } });
});

module.exports = { createAppointment, getAppointments, updateAppointmentStatus };
