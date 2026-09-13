const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const prisma = require("./lib/prisma");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   API ROUTES
========================================================= */

app.use("/auth", authRoutes);
app.use("/listings", listingRoutes);
app.use("/admin", adminRoutes);

/* =========================================================
   API HOME
========================================================= */

app.get("/", (req, res) => {
  res.json({
    message: "UniBite API running",
  });
});

/* =========================================================
   DASHBOARD
   Returns fresh user information from the database
========================================================= */

app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been banned",
      });
    }

    res.json({
      message: "Welcome to your UniBite dashboard",
      user,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   404 - ROUTE NOT FOUND
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* =========================================================
   START SERVER
========================================================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`UniBite server running on port ${PORT}`);
});