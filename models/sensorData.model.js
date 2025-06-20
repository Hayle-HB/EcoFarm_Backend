// models/sensorData.model.js

const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema({
  sensorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sensor",
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String, // e.g., "°C", "%", "pH"
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SensorData = mongoose.model("SensorData", sensorDataSchema);

module.exports = SensorData;
