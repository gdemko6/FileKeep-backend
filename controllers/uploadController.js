const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function uploadFile(req, res) {
  try {
    const { folderId } = req.body;

    if (!req.file || !folderId) {
      return res.status(400).json({ message: "Missing file or folder ID" });
    }

    const file = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        path: req.file.path,
        userId: req.user.id,
        folderId: folderId,
      },
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: file.id,
        filename: file.filename,
        folderId: file.folderId,
      },
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Server error during file upload" });
  }
}

module.exports = { uploadFile };
