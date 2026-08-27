const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Notification = require("../models/Notification");

// @route GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;
  const query = { recipient: req.user._id };
  if (unreadOnly === "true") query.isRead = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.status(200).json({ success: true, data: { notifications, unreadCount } });
});

// @route PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw new ApiError(404, "Notification not found");
  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, data: { notification } });
});

// @route PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
