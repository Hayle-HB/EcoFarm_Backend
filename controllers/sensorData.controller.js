const SensorData = require("../models/sensorData.model");
const mongoose = require("mongoose");

// Get latest readings from all sensors
const getAllLatestSensorData = async (req, res) => {
  try {
    // Aggregate to get the latest entry for each sensorId
    const latestData = await SensorData.aggregate([
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$sensorId",
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" },
      },
    ]).exec();
    res.json(latestData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get latest data for a specific sensor
const getLatestDataBySensorId = async (req, res) => {
  try {
    const { sensorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      return res.status(400).json({ error: "Invalid sensorId" });
    }
    const latest = await SensorData.findOne({ sensorId })
      .sort({ timestamp: -1 })
      .exec();
    if (!latest) {
      return res.status(404).json({ error: "No data found for this sensor" });
    }
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new sensor data
const createSensorData = async (req, res) => {
  try {
    const { sensorId, value, unit, timestamp } = req.body;
    if (!sensorId || value === undefined || !unit) {
      return res
        .status(400)
        .json({ error: "sensorId, value, and unit are required" });
    }
    const data = new SensorData({
      sensorId,
      value,
      unit,
      timestamp: timestamp ? new Date(timestamp) : undefined,
    });
    await data.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get historical data for a sensor within a date range
const getSensorHistory = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { from, to } = req.query;
    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      return res.status(400).json({ error: "Invalid sensorId" });
    }
    const query = { sensorId };
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }
    const history = await SensorData.find(query).sort({ timestamp: 1 }).exec();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllLatestSensorData,
  getLatestDataBySensorId,
  createSensorData,
  getSensorHistory,
};
