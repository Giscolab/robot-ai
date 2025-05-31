import { emotionConfig, currentEmotion } from '../core/emotion.js';
import { log } from '../core/logger.js';

export function updateServo(axis, value) {
  const valueDisplay = document.getElementById(`servo${axis}Value`);
  
  // Affiche la valeur sur l’UI si l’élément existe
  if (valueDisplay) {
    valueDisplay.textContent = value;
  }

  // Log système
  log(`Servo ${axis} → ${value}°`);

  // Sécurise la mise à jour de l’œil (évite erreur si émotion inconnue)
  const eyeColor = emotionConfig[currentEmotion]?.eye || '#00f';
  document.documentElement.style.setProperty('--eye-color', eyeColor);
}
