const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs").promises;

// Middleware to check authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized: Please log in" });
}

// Get all files from a user
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Delete file
router.delete("/:fileId", ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the actual file that is stored on disk
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error("Failed to delete file from disk:", err);
      return res
        .status(500)
        .json({ message: "Failed to delete file from disk" });
    }

    // Delete the file metadata in the database
    await prisma.file.delete({
      where: { id: file.id },
    });

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting file" });
  }
});

// Download file
router.get("/:fileId/download", ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    if (file.userId !== req.user.id || file.folderId !== req.params.id) {
      return res.status(403).send("Unauthorized");
    }

    res.download(file.path, file.filename);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading file");
  }
});

module.exports = router;
