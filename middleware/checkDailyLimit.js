const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async function checkDailyLimit(req, res, next) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const fileCount = await prisma.file.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
      },
    },
  });

  if (fileCount >= 50) {
    return res
      .status(429)
      .json({ message: "Daily upload limit reached (50 files)" });
  }

  next();
};
