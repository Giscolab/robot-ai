import { log } from './logger.js';

export class EnergyMonitor {
  constructor(config = {}) {
    this.history = [];
    this.config = {
      maxVoltage: 5,
      maxCurrent: 2,
      maxMotorLoad: 100,
      maxTemp: 80,
      ...config
    };
  }

  update(data) {
    if (!data) return;

    const { voltage, current, motorLoad, temp } = data;

    const entry = {
      timestamp: Date.now(),
      voltage,
      current,
      motorLoad,
      temp,
      efficiency: this.calculateEfficiency(voltage, current, motorLoad)
    };

    this.history.push(entry);
    this._logTelemetry(entry);
  }

  calculateEfficiency(voltage, current, load) {
    try {
      const power = voltage * current;
      const normalizedLoad = Math.min(load, this.config.maxMotorLoad) / this.config.maxMotorLoad;
      return (normalizedLoad / power).toFixed(3);
    } catch (e) {
      log(`Erreur calcul efficacité: ${e.message}`, 'error');
      return 0;
    }
  }

  _logTelemetry(entry) {
    const msg = `🔌 ${entry.voltage.toFixed(2)}V | 🔁 ${entry.current.toFixed(2)}A | ⚙️ ${entry.motorLoad}% | 🌡️ ${entry.temp}°C | ⚡ Eff: ${entry.efficiency}`;
    log(msg, 'info');
  }

  getLastEntry() {
    return this.history[this.history.length - 1] || null;
  }

  clearHistory() {
    this.history = [];
    log('Historique énergétique effacé', 'info');
  }
}

export default new EnergyMonitor();
