const express = require("express");
const router = express.Router();
const { uploadFile, getUpload } = require("../controllers/uploadController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const checkDailyLimit = require("../middleware/checkDailyLimit");

router.post("/", checkDailyLimit, upload.single("file-upload"), uploadFile);

module.exports = router;
