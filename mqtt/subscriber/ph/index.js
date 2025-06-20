const client = require("../../mainBroker/broker");
const phSensorHandler = require("./phSensorHandler");
const topic = "ecofarmiq/device/ph_sensor";

let isSubscribed = false;

const subscribeToPhSensor = () => {
  if (isSubscribed) {
    console.log("Already subscribed to pH sensor topic");
    return;
  }

  client.subscribe(topic, { qos: 1 }, (err) => {
    if (err) {
      console.error("Failed to subscribe to pH sensor topic:", err);
      return;
    }
    console.log(`Successfully subscribed to ${topic}`);
    isSubscribed = true;
  });

  // Handle incoming messages
  client.on("message", (receivedTopic, message) => {
    if (receivedTopic === topic) {
      phSensorHandler.handleMessage(message).catch((err) => {
        console.error("Error in pH sensor message handler:", err);
      });
    }
  });

  // Handle connection errors
  client.on("error", (err) => {
    console.error("MQTT connection error:", err);
    isSubscribed = false;
  });

  // Handle reconnection
  client.on("reconnect", () => {
    console.log("Attempting to reconnect to MQTT broker...");
    isSubscribed = false;
  });

  // Handle disconnection
  client.on("close", () => {
    console.log("Disconnected from MQTT broker");
    isSubscribed = false;
  });
};

// Function to unsubscribe
const unsubscribeFromPhSensor = () => {
  if (!isSubscribed) {
    return;
  }

  client.unsubscribe(topic, (err) => {
    if (err) {
      console.error("Failed to unsubscribe from pH sensor topic:", err);
      return;
    }
    console.log(`Successfully unsubscribed from ${topic}`);
    isSubscribed = false;
  });
};

module.exports = {
  subscribeToPhSensor,
  unsubscribeFromPhSensor,
};
