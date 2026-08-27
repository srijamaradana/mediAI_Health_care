const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { addRecord, getRecords, deleteRecord } = require("../controllers/healthRecordController");

const router = express.Router();
router.use(protect);

router.post(
  "/",
  [body("type").notEmpty(), body("value").notEmpty()],
  validate,
  addRecord
);
router.get("/", getRecords);
router.delete("/:id", deleteRecord);

module.exports = router;
