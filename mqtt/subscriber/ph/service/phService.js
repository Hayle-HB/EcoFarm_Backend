const prisma = require("../../../../prisma/client");
const { ALERT_LEVELS, PH_RANGES } = require("../phSensorHandler");
const phCommandService = require("./phCommandService");

class PHService {
  constructor() {
    this.alertThresholds = {
      critical: {
        low: PH_RANGES.CRITICAL_LOW,
        high: PH_RANGES.CRITICAL_HIGH,
        cooldown: 5 * 60 * 1000, // 5 minutes in milliseconds
      },
      warning: {
        low: PH_RANGES.WARNING_LOW,
        high: PH_RANGES.WARNING_HIGH,
        cooldown: 15 * 60 * 1000, // 15 minutes in milliseconds
      },
    };
    this.lastAlertTimes = new Map();
  }

  /**
   * Process pH reading and determine if any actions are needed
   * @param {Object} reading - The pH reading object
   * @returns {Promise<Object>} - The processed result
   */
  async processReading(reading) {
    try {
      const { value, timestamp, device_id } = reading;
      const alertLevel = this.determineAlertLevel(value);
      const actions = await this.determineActions(
        alertLevel,
        value,
        device_id,
        timestamp
      );

      // Log the alert if any actions were taken
      if (actions.length > 0) {
        await this.logAlert({
          device_id,
          value,
          timestamp,
          alertLevel,
          actions,
        });
      }

      return {
        alertLevel,
        actions,
        processed: true,
      };
    } catch (error) {
      console.error("Error processing pH reading:", error);
      throw error;
    }
  }

  /**
   * Determine the alert level based on pH value
   * @param {number} value - The pH value
   * @returns {string} - The alert level
   */
  determineAlertLevel(value) {
    if (value <= PH_RANGES.CRITICAL_LOW || value >= PH_RANGES.CRITICAL_HIGH) {
      return ALERT_LEVELS.CRITICAL;
    }
    if (value <= PH_RANGES.WARNING_LOW || value >= PH_RANGES.WARNING_HIGH) {
      return ALERT_LEVELS.WARNING;
    }
    return ALERT_LEVELS.NORMAL;
  }

  /**
   * Determine what actions should be taken based on the alert level
   * @param {string} alertLevel - The alert level
   * @param {number} value - The pH value
   * @param {string} device_id - The device ID
   * @param {Date} timestamp - The timestamp of the reading
   * @returns {Promise<Array>} - Array of actions to take
   */
  async determineActions(alertLevel, value, device_id, timestamp) {
    const actions = [];
    const deviceKey = `${device_id}_${alertLevel}`;
    const lastAlertTime = this.lastAlertTimes.get(deviceKey) || 0;
    const now = timestamp.getTime();

    // Check if we're within cooldown period
    const cooldown =
      this.alertThresholds[alertLevel.toLowerCase()]?.cooldown || 0;
    if (now - lastAlertTime < cooldown) {
      return actions;
    }

    switch (alertLevel) {
      case ALERT_LEVELS.CRITICAL:
        actions.push(
          await this.sendCriticalAlert(device_id, value),
          await this.adjustWaterTreatment(device_id, value),
          await this.notifyMaintenance(device_id, value)
        );
        break;

      case ALERT_LEVELS.WARNING:
        actions.push(
          await this.sendWarningAlert(device_id, value),
          await this.scheduleMaintenanceCheck(device_id, value)
        );
        break;
    }

    // Update last alert time
    this.lastAlertTimes.set(deviceKey, now);
    return actions.filter((action) => action !== null);
  }

  /**
   * Send a critical alert
   * @param {string} device_id - The device ID
   * @param {number} value - The pH value
   * @returns {Promise<Object>} - The alert action
   */
  async sendCriticalAlert(device_id, value) {
    const message = `Critical pH level detected: ${value}`;
    await phCommandService.sendAlertCommand(device_id, "CRITICAL", message);

    // If pH is extremely out of range, trigger emergency shutdown
    if (
      value <= PH_RANGES.CRITICAL_LOW - 1 ||
      value >= PH_RANGES.CRITICAL_HIGH + 1
    ) {
      await phCommandService.sendEmergencyShutdown(
        device_id,
        `Extreme pH level: ${value}`
      );
    }

    return {
      type: "CRITICAL_ALERT",
      message,
      timestamp: new Date(),
    };
  }

  /**
   * Send a warning alert
   * @param {string} device_id - The device ID
   * @param {number} value - The pH value
   * @returns {Promise<Object>} - The warning action
   */
  async sendWarningAlert(device_id, value) {
    const message = `Warning: pH level outside optimal range: ${value}`;
    await phCommandService.sendAlertCommand(device_id, "WARNING", message);

    return {
      type: "WARNING_ALERT",
      message,
      timestamp: new Date(),
    };
  }

  /**
   * Adjust water treatment based on pH level
   * @param {string} device_id - The device ID
   * @param {number} value - The pH value
   * @returns {Promise<Object>} - The adjustment action
   */
  async adjustWaterTreatment(device_id, value) {
    const targetPh = (PH_RANGES.OPTIMAL_LOW + PH_RANGES.OPTIMAL_HIGH) / 2; // Target middle of optimal range
    await phCommandService.sendPhAdjustmentCommand(device_id, targetPh, value);

    return {
      type: "WATER_TREATMENT_ADJUSTMENT",
      action: value < targetPh ? "increase" : "decrease",
      targetPh,
      currentPh: value,
      timestamp: new Date(),
    };
  }

  /**
   * Notify maintenance team
   * @param {string} device_id - The device ID
   * @param {number} value - The pH value
   * @returns {Promise<Object>} - The maintenance notification
   */
  async notifyMaintenance(device_id, value) {
    const action = `Check pH sensor and water treatment system. Current pH: ${value}`;
    await phCommandService.sendMaintenanceCommand(device_id, "HIGH", action);

    return {
      type: "MAINTENANCE_NOTIFICATION",
      priority: "HIGH",
      action,
      timestamp: new Date(),
    };
  }

  /**
   * Schedule maintenance check
   * @param {string} device_id - The device ID
   * @param {number} value - The pH value
   * @returns {Promise<Object>} - The scheduled maintenance
   */
  async scheduleMaintenanceCheck(device_id, value) {
    const action = `Schedule pH sensor calibration. Current pH: ${value}`;
    await phCommandService.sendMaintenanceCommand(device_id, "MEDIUM", action);

    return {
      type: "SCHEDULE_MAINTENANCE",
      priority: "MEDIUM",
      action,
      timestamp: new Date(),
    };
  }

  /**
   * Log alert to database
   * @param {Object} alertData - The alert data
   * @returns {Promise<void>}
   */
  async logAlert(alertData) {
    try {
      await prisma.pHAlert.create({
        data: {
          deviceId: alertData.device_id,
          value: alertData.value,
          timestamp: alertData.timestamp,
          alertLevel: alertData.alertLevel,
          actions: alertData.actions,
          metadata: {
            processed: true,
            notificationSent: true,
          },
        },
      });
    } catch (error) {
      console.error("Error logging alert:", error);
    }
  }

  /**
   * Get recent alerts
   * @param {number} limit - Number of alerts to retrieve
   * @returns {Promise<Array>} - Array of recent alerts
   */
  async getRecentAlerts(limit = 10) {
    try {
      return await prisma.pHAlert.findMany({
        orderBy: {
          timestamp: "desc",
        },
        take: limit,
      });
    } catch (error) {
      console.error("Error fetching recent alerts:", error);
      return [];
    }
  }

  /**
   * Get alerts by level
   * @param {string} alertLevel - The alert level to filter by
   * @param {number} limit - Number of alerts to retrieve
   * @returns {Promise<Array>} - Array of filtered alerts
   */
  async getAlertsByLevel(alertLevel, limit = 10) {
    try {
      return await prisma.pHAlert.findMany({
        where: {
          alertLevel: alertLevel,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: limit,
      });
    } catch (error) {
      console.error("Error fetching alerts by level:", error);
      return [];
    }
  }
}

module.exports = new PHService();
