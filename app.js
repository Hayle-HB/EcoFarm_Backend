require("dotenv").config();
require("./config/MongoDB");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
  })
);

// Routes
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

app.get("/", (req, res) => {
  res.send("EcoFarms API, if you want to get the Website link visit: https://ecofarmiq.vercel.app/");
});

// Handle undefined routes
// app.use("*", (req, res) => {
//   res.status(404).json({
//     status: "fail",
//     message: "Route not found",
//   });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
