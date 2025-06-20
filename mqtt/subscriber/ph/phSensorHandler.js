const prisma = require("../../../prisma/client");

// Constants for pH ranges
const PH_RANGES = {
  CRITICAL_LOW: 4.0,
  WARNING_LOW: 5.5,
  OPTIMAL_LOW: 6.0,
  OPTIMAL_HIGH: 7.0,
  WARNING_HIGH: 7.5,
  CRITICAL_HIGH: 8.0,
};

// Alert levels
const ALERT_LEVELS = {
  CRITICAL: "CRITICAL",
  WARNING: "WARNING",
  NORMAL: "NORMAL",
};

function validatePhData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data format");
  }

  if (typeof data.ph !== "number" || isNaN(data.ph)) {
    throw new Error("Invalid pH value");
  }

  if (data.ph < 0 || data.ph > 14) {
    throw new Error("pH value out of valid range (0-14)");
  }

  return true;
}

function determineAlertLevel(phValue) {
  if (phValue <= PH_RANGES.CRITICAL_LOW || phValue >= PH_RANGES.CRITICAL_HIGH) {
    return ALERT_LEVELS.CRITICAL;
  }
  if (phValue <= PH_RANGES.WARNING_LOW || phValue >= PH_RANGES.WARNING_HIGH) {
    return ALERT_LEVELS.WARNING;
  }
  return ALERT_LEVELS.NORMAL;
}

async function savePhReading(data) {
  try {
    // Parse the timestamp from the incoming data
    let timestamp;
    if (data.timestamp) {
      // If timestamp is provided in ISO format
      if (typeof data.timestamp === "string") {
        timestamp = new Date(data.timestamp);
      } else if (data.timestamp instanceof Date) {
        timestamp = data.timestamp;
      } else if (typeof data.timestamp === "number") {
        timestamp = new Date(data.timestamp);
      }
    }

    // If timestamp is invalid or not provided, use current time
    if (!timestamp || isNaN(timestamp.getTime())) {
      timestamp = new Date();
    }

    const reading = await prisma.pHReading.create({
      data: {
        value: data.ph,
        timestamp: timestamp,
        alertLevel: determineAlertLevel(data.ph),
        metadata: {
          deviceId: data.device_id || "unknown",
          location: data.location || "unknown",
          temperature: data.temperature || null,
          humidity: data.humidity || null,
          rawTimestamp: data.timestamp, // Store the original timestamp for debugging
        },
      },
    });
    console.log("Successfully saved pH reading:", {
      id: reading.id,
      value: reading.value,
      timestamp: reading.timestamp,
      alertLevel: reading.alertLevel,
    });
    return reading;
  } catch (error) {
    console.error("Error saving pH reading:", error);
    throw error;
  }
}

// Function to get recent pH readings
async function getRecentReadings(limit = 10) {
  try {
    return await prisma.pHReading.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching recent readings:", error);
    return [];
  }
}

// Function to get readings by alert level
async function getReadingsByAlertLevel(alertLevel, limit = 10) {
  try {
    return await prisma.pHReading.findMany({
      where: {
        alertLevel: alertLevel,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching readings by alert level:", error);
    return [];
  }
}

async function handleMessage(message) {
  try {
    const data = JSON.parse(message.toString());
    console.log("pH sensor data received:", data);

    // Validate the data
    validatePhData(data);

    // Determine alert level
    const alertLevel = determineAlertLevel(data.ph);

    // Log appropriate message based on alert level
    switch (alertLevel) {
      case ALERT_LEVELS.CRITICAL:
        console.error(
          `CRITICAL: pH value ${data.ph} is outside critical range!`
        );
        break;
      case ALERT_LEVELS.WARNING:
        console.warn(`WARNING: pH value ${data.ph} is outside optimal range`);
        break;
      default:
        console.log(`Normal pH reading: ${data.ph}`);
    }

    // Save the reading to database
    await savePhReading(data);

    // TODO: Implement notification system for critical alerts
    if (alertLevel === ALERT_LEVELS.CRITICAL) {
      // Implement notification logic here
    }
  } catch (err) {
    console.error("Error processing pH sensor message:", err);
    // TODO: Implement error reporting system
  }
}

module.exports = {
  handleMessage,
  getRecentReadings,
  getReadingsByAlertLevel,
};
