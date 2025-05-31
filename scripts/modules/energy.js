import CoreSystem from '../core/coreSystem.js';

class EnergyMonitorUI {
  constructor() {
    this.consumption = {
      cpu: 0,
      motors: 0,
      leds: 0
    };
  }

  update(component, value) {
    this.consumption[component] = value;
    this.render();
  }

  render() {
    const total = Object.values(this.consumption).reduce((a, b) => a + b, 0);
    const barContainer = document.getElementById('energyConsumption');
    const bar = barContainer ? barContainer.querySelector('div') : null;
    if (!bar) return;

    const percent = Math.min(total * 10, 100);
    bar.style.width = `${percent}%`;
    bar.style.background = total > 8 ? '#f00' : '#0f0';
    bar.title = `Total: ${percent.toFixed(1)}%`;
  }
}

const energyMonitor = new EnergyMonitorUI();

function updateEnergyConsumption(sensors) {
  const servoXInput = document.getElementById('servoX');
  const servoX = servoXInput ? parseInt(servoXInput.value, 10) : 0;
  const ledColor = getComputedStyle(document.documentElement).getPropertyValue('--led-color').trim();

  energyMonitor.update('cpu', sensors.temp / 10);
  energyMonitor.update('motors', Math.abs(90 - servoX) / 10);
  energyMonitor.update('leds', ledColor === '#f00' ? 1 : ledColor === '#0f0' ? 0.3 : 0.1);

  // Envoi métier au module centralisé
  const system = CoreSystem?.instance;
  if (system?.energy?.update) {
    system.energy.update({
      voltage: sensors.voltage || 5,
      current: sensors.current || 0.6,
      motorLoad: sensors.motorLoad || 25,
      temp: sensors.temp || 30
    });
  }
}

export { energyMonitor, updateEnergyConsumption };
