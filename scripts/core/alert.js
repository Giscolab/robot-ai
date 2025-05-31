// scripts/core/alerts.js
import { log } from './logger.js';
import CoreSystem from './coreSystem.js';

const STORAGE_KEY = 'alert_history';
const DEFAULT_THRESHOLDS = {
  temp: 75,    // °C
  current: 1.8, // A
  vibration: 4.5 // m/s²
};

export const AlertSystem = {
  history: [],
  activeAlerts: new Map(),
  config: {},

  async init(config = {}) {
    try {
      this.config = { ...DEFAULT_THRESHOLDS, ...config };
      await this._loadHistory();
      log('AlertSystem initialized', 'info');
    } catch (error) {
      log(`AlertSystem init failed: ${error.message}`, 'error');
    }
  },

  checkConditions(telemetry) {
    try {
      if (!telemetry) return;
      
      const checks = [
        { metric: 'temp', condition: (v) => v > this.config.temp },
        { metric: 'current', condition: (v) => v > this.config.current }
      ];

      checks.forEach(({ metric, condition }) => {
        if (telemetry[metric] && condition(telemetry[metric])) {
          this.handle(
            `${metric.toUpperCase()} hors limites: ${telemetry[metric]}`, 
            this._getSeverity(telemetry[metric], metric)
          );
        }
      });
    } catch (error) {
      log(`Alert check failed: ${error.message}`, 'error');
    }
  },

  handle(message, severity = 'warning') {
    try {
      const alert = {
        id: Date.now(),
        message,
        severity,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };

      this.history.push(alert);
      this.activeAlerts.set(alert.id, alert);
      
      log(`ALERTE: ${message}`, severity);
      this._saveHistory();
      this._sendToMonitoring(alert);
      
      if (CoreSystem.config?.env === 'production') {
        this._triggerVisualAlert(severity);
      }
    } catch (error) {
      log(`Alert handling failed: ${error.message}`, 'critical');
    }
  },

  async _sendToMonitoring(alert) {
    try {
      if (CoreSystem.monitoring?.enabled) {
        await CoreSystem.api.post('/alerts', alert);
      }
    } catch (error) {
      log(`Alert monitoring failed: ${error.message}`, 'error');
    }
  },

  _getSeverity(value, metric) {
    const ranges = {
      temp: {
        warning: this.config.temp * 1.1,
        critical: this.config.temp * 1.2
      },
      current: {
        warning: this.config.current * 1.15,
        critical: this.config.current * 1.3
      }
    };

    if (value >= ranges[metric].critical) return 'critical';
    if (value >= ranges[metric].warning) return 'warning';
    return 'info';
  },

  _triggerVisualAlert(severity) {
    const alertElement = document.getElementById('global-alert');
    if (alertElement) {
      alertElement.className = `alert-${severity}`;
      alertElement.textContent = 'ALERTE SYSTÈME - Voir le journal';
    }
  },

  async _loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.history = JSON.parse(saved);
        log('Alert history loaded', 'info');
      }
    } catch (error) {
      log(`History load failed: ${error.message}`, 'error');
    }
  },

  _saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      log(`History save failed: ${error.message}`, 'error');
    }
  },

  clearHistory() {
    this.history = [];
    this.activeAlerts.clear();
    localStorage.removeItem(STORAGE_KEY);
    log('Alert history cleared', 'info');
  },

  listActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  },

  acknowledgeAlert(id) {
    const alert = this.activeAlerts.get(id);
    if (alert) {
      alert.acknowledged = true;
      this.activeAlerts.delete(id);
      this._saveHistory();
    }
  }
};

// Initialisation automatique en production
if (CoreSystem.config?.env === 'production') {
  AlertSystem.init(CoreSystem.config.alerts);
}

// Exemple d'utilisation :
// AlertSystem.checkConditions({ temp: 80, current: 2.0 });
// AlertSystem.handle('Test alert', 'info');