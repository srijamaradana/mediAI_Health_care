const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const {
  addMedication,
  getMedications,
  updateMedication,
  logDose,
  deleteMedication,
} = require("../controllers/medicationController");

const router = express.Router();
router.use(protect);

router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("dosage").notEmpty(),
    body("frequency").notEmpty(),
    body("startDate").isISO8601(),
  ],
  validate,
  addMedication
);
router.get("/", getMedications);
router.put("/:id", updateMedication);
router.post("/:id/log", [body("status").isIn(["taken", "missed", "skipped"])], validate, logDose);
router.delete("/:id", deleteMedication);

module.exports = router;
