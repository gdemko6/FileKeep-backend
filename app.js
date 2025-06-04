const express = require("express");
const session = require("express-session");
require("dotenv").config();
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("./auth");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const signupRoutes = require("./routes/signupRoutes");
const loginRoutes = require("./routes/loginRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const folderRoutes = require("./routes/folderRoutes");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const logoutRoutes = require("./routes/logoutRoutes");
const app = express();
const prisma = new PrismaClient();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: "https://gdemko-filemanager.app",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File too large. Max is 50MB." });
  }
  next(err);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: true, sameSite: "none" },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 500 * 60 * 1000,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/signup", signupRoutes);
app.use("/login", loginRoutes);
app.use("/upload", uploadRoutes);
app.use("/folders", folderRoutes);
app.use("/me", authRoutes);
app.use("/files", fileRoutes);
app.use("/logout", logoutRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
