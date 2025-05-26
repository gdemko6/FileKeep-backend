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

// GET all folders for the logged-in user
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json({ folders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching folders" });
  }
});

// POST create a new folder
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;

    // Limit folder names to be 20 characters or less
    if (!name || name.length > 20) {
      return res
        .status(400)
        .json({ message: "Folder name must be 20 characters or fewer" });
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    res.status(201).json({ folder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating folder" });
  }
});

// DELETE a folder (and its files)
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot delete this folder" });
    }

    await prisma.file.deleteMany({ where: { folderId: req.params.id } });
    await prisma.folder.delete({ where: { id: req.params.id } });

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting folder" });
  }
});

// GET a specific folder and its files
router.get("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const folderId = req.params.id;

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { files: true },
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json({ folder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving folder" });
  }
});

// DELETE a file inside a folder
router.delete("/:id/:fileId", ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.userId !== req.user.id || file.folderId !== req.params.id) {
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

// GET a file download
router.get("/:id/:fileId/download", ensureAuthenticated, async (req, res) => {
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
