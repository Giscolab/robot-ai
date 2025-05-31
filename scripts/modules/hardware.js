import { log } from '../core/logger.js';
import { updateServo } from './servo.js';

// Gère les commandes matérielles reçues
export function handleHardwareResponse(command) {
  log(`Commande reçue via WebSocket → ${command}`);

  if (command.startsWith('servoX')) {
    const value = parseInt(command.split(':')[1]);
    updateServo('X', value);
  } else if (command.startsWith('servoY')) {
    const value = parseInt(command.split(':')[1]);
    updateServo('Y', value);
  } else if (command.startsWith('emotion')) {
    const emotion = command.split(':')[1];
    const select = document.getElementById('emotionSelect');
    if (select) select.value = emotion;
    const event = new Event('change');
    select?.dispatchEvent(event);
  } else {
    log(`Commande non reconnue: ${command}`);
  }
}

// Nouvelle fonction exportée (placeholder pour l'instant)
export const SensorVisualization = {
  init: () => console.warn('Visualisation des capteurs non implémentée'),
  update: (data) => console.log('Données capteurs:', data)
};