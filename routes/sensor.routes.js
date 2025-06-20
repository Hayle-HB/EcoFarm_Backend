// sensors.routes.js

const express = require("express");
const router = express.Router();

// Sensor controller functions (define these in a separate controller file)
const {
  getAllSensors,
  createSensor,
  getSensorById,
  updateSensor,
  deleteSensor,
} = require("../controllers/sensor.controllers");

router.get("/", getAllSensors); // GET /api/sensors – Get all sensor devices
router.post("/", createSensor); // POST /api/sensors – Register a new sensor
router.get("/:id", getSensorById); // GET /api/sensors/:id – Get specific sensor info
router.put("/:id", updateSensor); // PUT /api/sensors/:id – Update sensor info
router.delete("/:id", deleteSensor); // DELETE /api/sensors/:id – Remove a sensor

module.exports = router;
