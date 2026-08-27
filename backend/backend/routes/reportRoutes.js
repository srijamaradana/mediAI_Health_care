const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadReport, getReports, deleteReport } = require("../controllers/reportController");

const router = express.Router();
router.use(protect);

router.post("/", upload.single("file"), uploadReport);
router.get("/", getReports);
router.delete("/:id", deleteReport);

module.exports = router;
