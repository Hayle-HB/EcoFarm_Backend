// routes/sensorData.routes.js

const express = require("express");
const router = express.Router();

const {
  getAllLatestSensorData,
  getLatestDataBySensorId,
  createSensorData,
  getSensorHistory,
} = require("../controllers/sensorData.controller");

// GET /api/sensor-data – Get latest readings from all sensors
router.get("/", getAllLatestSensorData);

// GET /api/sensor-data/:sensorId – Get recent data from one sensor
router.get("/:sensorId", getLatestDataBySensorId);

// POST /api/sensor-data – Push data from a device (used by microcontrollers)
router.post("/", createSensorData);

// GET /api/sensor-data/history/:sensorId?from=DATE&to=DATE – Historical sensor data
router.get("/history/:sensorId", getSensorHistory);

module.exports = router;
