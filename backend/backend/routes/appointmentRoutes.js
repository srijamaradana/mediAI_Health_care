const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();
router.use(protect);

router.post(
  "/",
  authorize("patient"),
  [
    body("doctorId").notEmpty(),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("timeSlot").notEmpty(),
    body("reason").trim().notEmpty(),
  ],
  validate,
  createAppointment
);

router.get("/", getAppointments);
router.put("/:id/status", [body("status").notEmpty()], validate, updateAppointmentStatus);

module.exports = router;
