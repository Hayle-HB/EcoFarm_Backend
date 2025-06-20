require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const phRoutes = require("./routes/phRoutes");
const MongoDB = require("./config/MongoDB");
const User = require("./models/User");
const prisma = require("./prisma/client");
const app = express();
const sensorRoutes = require("./routes/sensor.routes");
const sensorDataRoutes = require("./routes/sensorData.routes");

// Initialize MongoDB
MongoDB();

// Set view engine
app.set("view engine", "ejs");

// Initialize Prisma and database
// async function initializeDatabase() {
//   try {
//     await prisma.$connect();
//     console.log("Successfully connected to MongoDB via Prisma");

//     // Test the connection by creating and deleting a test reading
//     const testReading = await prisma.pHReading.create({
//       data: {
//         value: 6.5,
//         timestamp: new Date(),
//         alertLevel: "NORMAL",
//         metadata: {
//           deviceId: "test_device",
//           location: "test_location",
//           temperature: 25,
//           humidity: 60,
//         },
//       },
//     });

//     await prisma.pHReading.delete({
//       where: { id: testReading.id },
//     });

//     console.log("Database connection verified successfully");
//   } catch (error) {
//     console.error("Error initializing database:", error);
//     process.exit(1);
//   }
// }

async function initializeDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());
app.use(cookieParser());
// allow all cors
// app.use(cors());

// CORS configuration
app.use(
  cors({
    origin: [
      "https://ecofarmiq.vercel.app", // Production frontend
      "https://ecofarmiq.proghubs.com", // Production frontend
      "http://localhost:5173", // Development frontend
      "http://localhost:3000", // Alternative development port
    ],
    credentials: true, // Allow credentials (cookies)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Routes

app.use("/api/auth", authRoutes);
// app.use("/api/ph", phRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/sensor-data", sensorDataRoutes);

// Test page route
app.get("/test", (req, res) => {
  res.render("Test");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
});

app.get("/", (req, res) => {
  res.send(
    "EcoFarms API, if you want to get the Website link visit: https://ecofarmiq.proghubs.com/"
  );
});

app.get("/api/auth/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Handle undefined routes
// app.use("*", (req, res) => {
//   res.status(404).json({
//     status: "fail",
//     message: "Route not found",
//   });
// });

// const mainMqtt = require("./mqtt/mqtt");

// // Initialize MQTT functionality
// try {
//   mainMqtt.initializePhSensor();
//   console.log("MQTT pH sensor subscription initialized successfully");
// } catch (error) {
//   console.error("Failed to initialize MQTT pH sensor:", error);
// }

const PORT = process.env.PORT || 1000;

// // Initialize database and start server
// initializeDatabase()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//       console.log(`Test URL: http://localhost:${PORT}/test`);
//     });
//   })
//   .catch((error) => {
//     console.error("Failed to initialize database:", error);
//     process.exit(1);
//   });

// // Handle graceful shutdown
// process.on("SIGINT", async () => {
//   console.log("Shutting down gracefully...");
//   await prisma.$disconnect();
//   process.exit(0);
// });

// process.on("SIGTERM", async () => {
//   console.log("Shutting down gracefully...");
//   await prisma.$disconnect();
//   process.exit(0);
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/test`);
});

module.exports = app;
