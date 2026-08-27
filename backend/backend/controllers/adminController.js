const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, pendingDoctors, totalAppointments, appointmentsByStatus] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'doctor' }),
    Doctor.countDocuments({ isVerified: false }),
    Appointment.countDocuments(),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  res.json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      pendingDoctorVerifications: pendingDoctors,
      totalAppointments,
      newUsersLast30Days,
      appointmentsByStatus: appointmentsByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    },
  });
});

module.exports = { getDashboardStats };
