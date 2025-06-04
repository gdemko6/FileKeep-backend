const express = require("express");
const router = express.Router();
const { uploadFile, getUpload } = require("../controllers/uploadController");
const multer = require("multer");
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB,
});
const checkDailyLimit = require("../middleware/checkDailyLimit");
const multerErrors = require("../middleware/multerErrors");

router.post(
  "/",
  checkDailyLimit,
  multerErrors(upload.single("file-upload")), // Wrapped in error handler to handle file size restriction without crashing front end
  uploadFile
);

module.exports = router;
