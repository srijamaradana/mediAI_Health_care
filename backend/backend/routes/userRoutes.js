const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put(
  "/change-password",
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })],
  validate,
  changePassword
);

// Admin-only user management
router.get("/", authorize("admin"), getAllUsers);
router.put("/:id/status", authorize("admin"), toggleUserStatus);

module.exports = router;
