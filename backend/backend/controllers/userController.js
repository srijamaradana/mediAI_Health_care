const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

// @route GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } });
});

// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const disallowed = ["password", "role", "email", "refreshToken", "isActive"];
  disallowed.forEach((field) => delete req.body[field]);

  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: { user: user.toSafeObject() } });
});

// @route PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: "Password updated successfully" });
});

// @route GET /api/users  (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: { users, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// @route PUT /api/users/:id/status  (admin only) - activate/deactivate a user
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  user.isActive = !user.isActive;
  await user.save();
  res.status(200).json({ success: true, data: { user: user.toSafeObject() } });
});

module.exports = { getProfile, updateProfile, changePassword, getAllUsers, toggleUserStatus };
