const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    // Only return non-sensitive user info
    const { id, email } = req.user;
    return res.json({ user: { id, email } });
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
});

module.exports = router;
