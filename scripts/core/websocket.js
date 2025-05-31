import { updateEnergyConsumption } from '../modules/energy.js';
import { energyMonitor } from '../modules/energy.js';
import { log } from './logger.js';
import CoreSystem from '../core/coreSystem.js';
import { handleHardwareResponse } from '../modules/hardware.js';
import { remoteRobertBlink, remoteSetMoniqueEmotion } from '../robots.js';

let wsConnected = false;

const mockWs = {
  async send(data) {
    try {
      const mockResponse = {
        sensors: {
          temp: Math.random() * 50 + 30,
          current: Math.random() * 2
        },
        timestamp: Date.now()
      };

      setTimeout(async () => {
        if (data.command) {
          await handleHardwareResponse(data.command);
        }
        updateEnergyConsumption(mockResponse.sensors);
      }, 300);
    } catch (error) {
      log(`Mock WS Error: ${error.message}`);
    }
  }
};

function toggleWebSocket() {
  wsConnected = !wsConnected;

  const button = document.querySelector('#wsToggleButton');
  if (button) {
    button.textContent = `WebSocket: ${wsConnected ? 'ON' : 'OFF'}`;
    button.classList.toggle('connected', wsConnected);
  }

  const status = document.getElementById('wsStatus');
  if (status) {
    status.className = wsConnected ? 'connected' : 'disconnected';
  }

  log(`WebSocket ${wsConnected ? 'activé' : 'désactivé'}`);

  if (wsConnected && process.env.NODE_ENV === 'development') {
    mockWs.send({ type: 'handshake' });
  }
}

const ProdWS = {
  _reconnectAttempts: 0,
  _maxReconnectAttempts: 5,

  connect() {
    try {
      const wsEndpoint = CoreSystem.config.services.ws[CoreSystem.config.env];
      const ws = CoreSystem.auth.secureWS(wsEndpoint);

      ws.addEventListener('message', async (event) => {
        if (!await this.validateMessage(event.data)) {
          ws.close();
          log('security', 'Message non sécurisé détecté', 'error');
          return;
        }

        const data = this._parseMessage(event.data);
        this.handleMessage(data);
      });

      ws.addEventListener('close', () => this._handleReconnect());
      return ws;
    } catch (error) {
      log(`WS Connection Error: ${error.message}`, 'error');
      return null;
    }
  },

  async validateMessage(data) {
    try {
      const [message, signature] = data.split('|');
      if (!message || !signature) return false;

      const key = await this._getHmacKey();
      return await crypto.subtle.verify(
        'HMAC',
        key,
        this._bufferFromBase64(signature),
        new TextEncoder().encode(message)
      );
    } catch (error) {
      log(`Message validation failed: ${error.message}`, 'warning');
      return false;
    }
  },

  async _getHmacKey() {
    const secret = await CoreSystem.auth.getSecret('ws-hmac-key');
    return crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
  },

  _parseMessage(data) {
    try {
      return JSON.parse(data.split('|')[0]);
    } catch {
      return null;
    }
  },

  handleMessage(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'telemetry':
        EnergyMonitor.update(data);
        break;
      
      case 'alert':
        AlertSystem.checkConditions(data);
        break;
      
      case 'robot_action':
        this._handleRobotAction(data);
        break;
    }
  },

  async _handleRobotAction(data) {
    try {
      switch (data.robot) {
        case 'robert':
          if (data.action === 'blink') await remoteRobertBlink();
          break;
        
        case 'monique':
          if (data.action === 'emotion') {
            await remoteSetMoniqueEmotion(data.emotion);
          }
          break;
      }
    } catch (error) {
      log(`Robot action failed: ${error.message}`, 'error');
    }
  },

  _handleReconnect() {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) return;

    setTimeout(() => {
      this._reconnectAttempts++;
      this.connect();
    }, Math.min(1000 * 2 ** this._reconnectAttempts, 30000));
  }
};

class RobotWebSocket {
  constructor(url, visualizer) {
    this.url = url;
    this.visualizer = visualizer;
    this.reconnectDelay = 1000;
    this.pingInterval = null;
    this._init();
  }

  _init() {
    this.socket = new WebSocket(this.url);
    this._setupEvents();
  }

  _setupEvents() {
    this.socket.onmessage = (event) => this._handleMessage(event);
    this.socket.onopen = () => this._handleConnectionOpen();
    this.socket.onerror = (error) => this._handleError(error);
    this.socket.onclose = () => this._handleReconnect();
  }

  async _handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'telemetry':
          EnergyMonitor.update(data);
          this.visualizer?.updateState?.(data);
          break;
        
        case 'alert':
          this._handleAlert(data);
          break;
        
        case 'robot_action':
          await this._handleRobotAction(data);
          break;
        
        case 'pong':
          this._handlePong();
          break;
      }
    } catch (error) {
      log(`Message handling error: ${error.message}`, 'warning');
    }
  }

  _handleConnectionOpen() {
    this.reconnectDelay = 1000;
    this.pingInterval = setInterval(() => {
      this.sendCommand('ping');
    }, 30000);
  }

  _handleError(error) {
    log(`WebSocket error: ${error.message}`, 'error');
    this.socket.close();
  }

  _handleReconnect() {
    clearInterval(this.pingInterval);
    setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
      this._init();
    }, this.reconnectDelay);
  }

  sendCommand(cmd) {
    if (this.socket.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: 'control',
        command: cmd,
        timestamp: Date.now()
      });
      this.socket.send(payload);
      return true;
    }
    log('WebSocket non connecté, commande ignorée.', 'warning');
    return false;
  }

  _handleAlert(data) {
    AlertSystem.handle(data.message, data.severity);
  }

  async _handleRobotAction(data) {
    try {
      switch (data.robot) {
        case 'robert':
          if (data.action === 'blink') await remoteRobertBlink();
          break;
        
        case 'monique':
          if (data.action === 'emotion') {
            await remoteSetMoniqueEmotion(data.emotion);
          }
          break;
      }
    } catch (error) {
      log(`Robot action failed: ${error.message}`, 'error');
    }
  }

  _handlePong() {
    this.reconnectDelay = 1000;
  }
}

export {
  toggleWebSocket,
  mockWs,
  ProdWS,
  RobotWebSocket
};