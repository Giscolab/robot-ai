// scripts/main.js

// ===== IMPORTS =====
// Components
import { RobertComponent, initRobert } from '../components/RobertComponent.js';
import { MoniqueComponent, initMonique } from '../components/MoniqueComponent.js';
import { ChatComponent } from '../components/ChatComponent.js';
import { ControlPanel } from '../components/ControlPanel.js';
import { FaceComponent } from '../components/FaceComponent.js';
import { TerminalComponent } from '../components/TerminalComponent.js';

// Core
import { log } from './core/logger.js';
import  CoreSystem  from './core/coreSystem.js';
import { updateEmotion, animateEyes } from './core/emotion.js';
import { toggleWebSocket, RobotWebSocket } from './core/websocket.js';
import { AlertSystem } from './core/alert.js';

// Modules
import { updateEnergyConsumption } from './modules/energy.js';
import { updateServo, ServoController } from './modules/servo.js';
import { processCommand } from './modules/chat.js';
import { RobotTerminal } from './modules/ssh.js';
import { handleHardwareResponse, SensorVisualization } from './modules/hardware.js';

// System
import { setupRouter } from './router.js';
import { initRobots } from './robots.js';

// Three.js
import { EnhancedRobot3D } from './threejs/robot3D.js';

// ===== CONFIGURATION =====
const Config = {
  env: 'simu',
  services: {
    ws: {
      simu: 'ws://localhost:8080',
      live: 'wss://prod.robot.com/secure'
    },
    api: {
      simu: 'http://localhost:3000',
      live: 'https://api.robot.com'
    }
  },
  setEnvironment(env) {
    this.env = env;
    document.dispatchEvent(new CustomEvent('envChanged'));
  }
};

// ===== CORE SYSTEMS =====
const AuthManager = (() => {
  const STORAGE_KEY = 'robot_auth';
  return {
    login({ login, pass }) {
      if (login === 'admin' && pass === 'robot123') {
        const token = btoa(JSON.stringify({
          user: 'admin',
          role: 'supervisor',
          exp: Date.now() + 86400000
        }));
        localStorage.setItem(STORAGE_KEY, token);
        return true;
      }
      return false;
    },
    checkAuth() {
      const token = localStorage.getItem(STORAGE_KEY);
      if (!token) return false;
      try {
        const data = JSON.parse(atob(token));
        return data.exp > Date.now() ? data : false;
      } catch {
        return false;
      }
    },
    secureWS(url) {
      const token = localStorage.getItem(STORAGE_KEY);
      return new WebSocket(`${url}?token=${token}`);
    }
  };
})();

class ModuleSystem {
  constructor() {
    this.modules = new Map();
  }

  async loadFromFolder() {
    try {
      const modules = await import.meta.glob('./modules/*.js');
      for (const path in modules) {
        const m = await modules[path]();
        this.modules.set(m.default.name, m.default);
        m.default.init?.();
      }
    } catch (error) {
      console.error('Module loading failed:', error);
      throw error;
    }
  }
}

// ===== UTILITY CLASSES =====
class EnergyMonitor {
  static consumptionHistory = [];
  
  static update(telemetry) {
    const power = this.calculatePower(telemetry.voltage, telemetry.current, telemetry.motorLoad);
    this.consumptionHistory.push({
      timestamp: Date.now(),
      power,
      estimate: this.estimateBatteryLife(power)
    });
    this.updateCharts?.();
  }

  static calculatePower(V, I, motorLoad) {
    const basePower = V * I;
    const motorEfficiency = 0.85 - (motorLoad * 0.01);
    return basePower * motorEfficiency;
  }

  static estimateBatteryLife(currentPower) {
    const batteryCapacity = 10000; // mAh
    return (batteryCapacity / (currentPower * 1000)).toFixed(1);
  }
}

class TelemetryCharts {
  constructor() {
    this.charts = { 
      power: this.initChart('energyChart', 'Consommation Énergétique') 
    };
  }

  initChart(canvasId, label) {
    return new Chart(document.getElementById(canvasId), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: label,
          data: [],
          borderColor: '#0f0'
        }]
      }
    });
  }

  update(data) {
    const now = new Date().toLocaleTimeString();
    Object.values(this.charts).forEach(chart => {
      chart.data.labels.push(now);
      chart.data.datasets[0].data.push(data.power);
      chart.update();
    });
  }
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Authentication check
    if (!AuthManager.checkAuth()) {
      window.location.href = '/login';
      return;
    }

    // System initialization
    const moduleSystem = new ModuleSystem();
    await moduleSystem.loadFromFolder();
    Config.setEnvironment('simu');

    // UI Setup
    const app = document.getElementById('app');
    if (!app) throw new Error('Main container #app not found');
    
    // Add core components
    [FaceComponent, ControlPanel, ChatComponent, TerminalComponent].forEach(component => {
      app.appendChild(component());
    });

    // Chat handlers
    const input = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendButton');
    if (sendBtn) sendBtn.addEventListener('click', processCommand);
    if (input) input.addEventListener('keydown', e => e.key === 'Enter' && processCommand());


    // Initialize subsystems
    animateEyes();
    initRobert();
    initMonique();
    initRobots();
    setupRouter();

    // 3D Visualization
    const visualizer = new EnhancedRobot3D();
    visualizer.startAnimation();

    // WebSocket connection
    const ws = new RobotWebSocket(Config.services.ws[Config.env], visualizer);
    window.addEventListener('beforeunload', () => ws.close());
    setTimeout(() => ws.sendCommand('INIT'), 1000);

    // Chart system setup
    const charts = new TelemetryCharts();
    EnergyMonitor.updateCharts = data => charts.update(data);

    // Event listeners
    const addListener = (id, event, callback) => {
      const element = document.getElementById(id);
      if (element) element.addEventListener(event, callback);
    };

    // Control bindings
    addListener('wsToggleButton', 'click', toggleWebSocket);
    addListener('sendButton', 'click', processCommand);
    addListener('userInput', 'keydown', e => e.key === 'Enter' && processCommand());
    addListener('servoX', 'input', e => updateServo('X', e.target.value));
    addListener('servoY', 'input', e => updateServo('Y', e.target.value));
    addListener('emotionSelect', 'change', e => updateEmotion(e.target.value));
    addListener('env-toggle', 'click', () => {
      Config.setEnvironment(Config.env === 'simu' ? 'live' : 'simu');
    });

    // Environment change handler
    document.addEventListener('envChanged', () => {
      const indicator = document.getElementById('env-indicator');
      if (indicator) {
        indicator.textContent = `Environnement: ${Config.env.toUpperCase()}`;
      }
    });

    log('System initialization complete');

  } catch (error) {
    console.error('Initialization error:', error);
    alert(`System initialization failed: ${error.message}`);
  }
});