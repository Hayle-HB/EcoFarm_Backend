const Sensor = require("../models/sensors.model");

// GET /api/sensors – Get all sensor devices
exports.getAllSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sensors" });
  }
};

// POST /api/sensors – Register a new sensor
exports.createSensor = async (req, res) => {
  try {
    const { name, type, location, status, lastReading } = req.body;
    const sensor = new Sensor({
      name,
      type,
      location,
      status,
      lastReading,
    });
    await sensor.save();
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ error: "Failed to create sensor" });
  }
};

// GET /api/sensors/:id – Get specific sensor info
exports.getSensorById = async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }
    res.json(sensor);
  } catch (error) {
    res.status(400).json({ error: "Invalid sensor ID" });
  }
};

// PUT /api/sensors/:id – Update sensor info
exports.updateSensor = async (req, res) => {
  try {
    const { name, type, location, status, lastReading } = req.body;
    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      { name, type, location, status, lastReading },
      { new: true, runValidators: true }
    );
    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }
    res.json(sensor);
  } catch (error) {
    res.status(400).json({ error: "Failed to update sensor" });
  }
};

// DELETE /api/sensors/:id – Remove a sensor
exports.deleteSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: "Sensor not found" });
    }
    res.json({ message: "Sensor deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete sensor" });
  }
};
