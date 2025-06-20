const {
  subscribeToPhSensor,
  unsubscribeFromPhSensor,
} = require("./subscriber/ph");

// Initialize pH sensor subscription
const initializePhSensor = () => {
  try {
    subscribeToPhSensor();
    console.log("pH sensor subscription initialized");
  } catch (error) {
    console.error("Failed to initialize pH sensor subscription:", error);
  }
};

// Cleanup function for graceful shutdown
const cleanup = () => {
  try {
    unsubscribeFromPhSensor();
    console.log("pH sensor subscription cleaned up");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};

// Handle process termination
process.on("SIGINT", () => {
  console.log("Received SIGINT. Cleaning up...");
  cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Cleaning up...");
  cleanup();
  process.exit(0);
});

// Export the phSubscriber function for backward compatibility
const phSubscriber = () => {
  console.log("Initializing pH sensor subscription...");
  initializePhSensor();
};

module.exports = {
  phSubscriber,
  initializePhSensor,
  cleanup,
};
