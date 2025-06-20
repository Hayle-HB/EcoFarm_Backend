const mqtt = require("mqtt");

const brokerUrl = "mqtt://broker.hivemq.com";

const client = mqtt.connect(brokerUrl);

client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

module.exports = client;
