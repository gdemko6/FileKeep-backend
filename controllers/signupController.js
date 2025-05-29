const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../utils/hashPassword");
const prisma = new PrismaClient();

async function signUpUser(req, res) {
  const user = req.body;

  try {
    const hashedPassword = await hashPassword(user.password);

    const newUser = await prisma.user.create({
      data: {
        email: user.emailtoLowerCase(),
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Email is already in use" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Unsuccessful sign-up" });
    }
  }
}

module.exports = { signUpUser };
