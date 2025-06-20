// models/sensors.model.js

const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String, // e.g., "soil moisture", "temperature", "humidity"
    required: true,
  },
  location: {
    type: String, // could also be coordinates: { lat, long }
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "faulty"],
    default: "active",
  },
  lastReading: {
    value: Number,
    timestamp: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Sensor = mongoose.model("Sensor", sensorSchema);



module.exports = Sensor;
