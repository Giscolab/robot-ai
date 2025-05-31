export function initWaveComponent(robotId = 'robotRobert') {
  const robot = document.getElementById(robotId);
  if (!robot) return;

  // Vérifie s’il existe déjà un container d’onde
  if (!document.getElementById('wave-container')) {
    const wave = document.createElement('div');
    wave.id = 'wave-container';
    robot.appendChild(wave);
  }

  updateWaveColor('neutral');
}

export function updateWaveColor(emotion) {
  const wave = document.getElementById('wave-container');
  if (!wave) return;

  const colors = {
    neutral: '#00f',
    happy: '#0f0',
    angry: '#f00',
    curious: '#ff0',
    sleepy: '#008'
  };

  wave.style.setProperty('--wave-color', colors[emotion] || '#00f');
}

// ⛓️ Hook pour injecter automatiquement l’update dans setEmotion
export function hookSetEmotion(setEmotionFunc) {
  return function(emotion) {
    setEmotionFunc(emotion);
    updateWaveColor(emotion);
  };
}
