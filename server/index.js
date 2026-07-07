const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/listings", listingRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "UniBite API running",
  });
});

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Protected dashboard",
    user: req.user,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});