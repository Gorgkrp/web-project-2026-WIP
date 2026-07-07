const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = require("../lib/prisma");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    if (user.isBanned) {
  return res.status(403).json({
    message: "This account has been banned",
  });
}

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "secretkey",
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});



router.get("/test-token/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || "secretkey",
    {
      expiresIn: "7d",
    }
  );

  res.json({
    token,
  });
});

module.exports = router;