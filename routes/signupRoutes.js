const express = require("express");
const router = express.Router();
signupController = require("../controllers/signupController");

router.post("/", signupController.signUpUser);

module.exports = router;