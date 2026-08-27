const express = require("express");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getAvailability,
  approveDoctor,
} = require("../controllers/doctorController");

const router = express.Router();

router.get("/", protect, getDoctors);
router.get("/:id", protect, getDoctorById);
router.get("/:id/availability", protect, getAvailability);
router.put("/profile", protect, authorize("doctor"), updateDoctorProfile);
router.put("/:id/approve", protect, authorize("admin"), approveDoctor);

module.exports = router;
