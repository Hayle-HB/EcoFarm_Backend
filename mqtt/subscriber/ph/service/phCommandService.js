const mqtt = require("mqtt");
const client = require("../../../mainBroker/broker");

class PHCommandService {
  constructor() {
    this.commandTopics = {
      waterTreatment: "ecofarmiq/device/water_treatment/command",
      maintenance: "ecofarmiq/device/maintenance/command",
      alert: "ecofarmiq/device/alert/command",
    };
  }

  /**
   * Send water treatment adjustment command
   * @param {string} deviceId - The device ID
   * @param {string} action - The action to take (increase/decrease)
   * @param {number} amount - The amount to adjust
   * @returns {Promise<void>}
   */
  async sendWaterTreatmentCommand(deviceId, action, amount) {
    const command = {
      type: "WATER_TREATMENT",
      deviceId,
      action,
      amount,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.publishCommand(this.commandTopics.waterTreatment, command);
      console.log(
        `Water treatment command sent to device ${deviceId}: ${action} by ${amount}`
      );
    } catch (error) {
      console.error("Error sending water treatment command:", error);
      throw error;
    }
  }

  /**
   * Send maintenance command
   * @param {string} deviceId - The device ID
   * @param {string} priority - The priority level (HIGH/MEDIUM/LOW)
   * @param {string} action - The maintenance action
   * @returns {Promise<void>}
   */
  async sendMaintenanceCommand(deviceId, priority, action) {
    const command = {
      type: "MAINTENANCE",
      deviceId,
      priority,
      action,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.publishCommand(this.commandTopics.maintenance, command);
      console.log(
        `Maintenance command sent to device ${deviceId}: ${action} (${priority} priority)`
      );
    } catch (error) {
      console.error("Error sending maintenance command:", error);
      throw error;
    }
  }

  /**
   * Send alert command
   * @param {string} deviceId - The device ID
   * @param {string} level - The alert level (CRITICAL/WARNING)
   * @param {string} message - The alert message
   * @returns {Promise<void>}
   */
  async sendAlertCommand(deviceId, level, message) {
    const command = {
      type: "ALERT",
      deviceId,
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.publishCommand(this.commandTopics.alert, command);
      console.log(
        `Alert command sent to device ${deviceId}: ${level} - ${message}`
      );
    } catch (error) {
      console.error("Error sending alert command:", error);
      throw error;
    }
  }

  /**
   * Publish command to MQTT topic
   * @param {string} topic - The MQTT topic
   * @param {Object} command - The command object
   * @returns {Promise<void>}
   */
  async publishCommand(topic, command) {
    return new Promise((resolve, reject) => {
      client.publish(topic, JSON.stringify(command), { qos: 1 }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Send pH adjustment command
   * @param {string} deviceId - The device ID
   * @param {number} targetPh - The target pH value
   * @param {number} currentPh - The current pH value
   * @returns {Promise<void>}
   */
  async sendPhAdjustmentCommand(deviceId, targetPh, currentPh) {
    const difference = targetPh - currentPh;
    const action = difference > 0 ? "increase" : "decrease";
    const amount = Math.abs(difference);

    await this.sendWaterTreatmentCommand(deviceId, action, amount);
  }

  /**
   * Send emergency shutdown command
   * @param {string} deviceId - The device ID
   * @param {string} reason - The reason for shutdown
   * @returns {Promise<void>}
   */
  async sendEmergencyShutdown(deviceId, reason) {
    const command = {
      type: "EMERGENCY_SHUTDOWN",
      deviceId,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.publishCommand(this.commandTopics.waterTreatment, command);
      console.log(
        `Emergency shutdown command sent to device ${deviceId}: ${reason}`
      );
    } catch (error) {
      console.error("Error sending emergency shutdown command:", error);
      throw error;
    }
  }

  /**
   * Send calibration command
   * @param {string} deviceId - The device ID
   * @returns {Promise<void>}
   */
  async sendCalibrationCommand(deviceId) {
    const command = {
      type: "CALIBRATION",
      deviceId,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.publishCommand(this.commandTopics.waterTreatment, command);
      console.log(`Calibration command sent to device ${deviceId}`);
    } catch (error) {
      console.error("Error sending calibration command:", error);
      throw error;
    }
  }
}

module.exports = new PHCommandService();
