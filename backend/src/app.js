
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");

const app = express();

// CORS configuration
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
