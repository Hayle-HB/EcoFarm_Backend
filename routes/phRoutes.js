const express = require("express");
const router = express.Router();
const {
  getRecentReadings,
  getReadingsByAlertLevel,
} = require("../mqtt/subscriber/ph/phSensorHandler");

// Get recent pH readings
router.get("/readings/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const readings = await getRecentReadings(limit);
    res.json(readings);
  } catch (error) {
    console.error("Error fetching recent readings:", error);
    res.status(500).json({ error: "Failed to fetch recent readings" });
  }
});

// Get readings by alert level
router.get("/readings/alert/:level", async (req, res) => {
  try {
    const level = req.params.level.toUpperCase();
    const limit = parseInt(req.query.limit) || 10;

    if (level === "ALL") {
      const readings = await getRecentReadings(limit);
      res.json(readings);
    } else {
      const readings = await getReadingsByAlertLevel(level, limit);
      res.json(readings);
    }
  } catch (error) {
    console.error("Error fetching readings by alert level:", error);
    res.status(500).json({ error: "Failed to fetch readings by alert level" });
  }
});

module.exports = router;
