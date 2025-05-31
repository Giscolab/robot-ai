let currentEmotion = 'neutral';
let eyeAnimationInterval = null;

const emotionConfig = {
  neutral: { eye: '#00f', led: '#00f', speed: 1000 },
  happy:   { eye: '#0f0', led: '#0f0', speed: 500 },
  angry:   { eye: '#f00', led: '#f00', speed: 200 },
  curious: { eye: '#ff0', led: '#880', speed: 300 },
  sleepy:  { eye: '#00f', led: '#008', speed: 2000 }
};

function updateEmotion(emotion) {
  if (!emotionConfig[emotion]) return;

  currentEmotion = emotion;
  const config = emotionConfig[emotion];
  document.documentElement.style.setProperty('--led-color', config.led);
  document.documentElement.style.setProperty('--eye-color', config.eye);

  const log = document.getElementById('systemLog');
  if (log) {
    log.textContent += `[${new Date().toLocaleTimeString()}] Émotion changée → ${emotion}\n`;

    const lines = log.textContent.split('\n');
    if (lines.length > 200) {
      log.textContent = lines.slice(-200).join('\n');
    }

    log.scrollTop = log.scrollHeight;
  }
}

function animateEyes() {
  if (eyeAnimationInterval) return; // Empêche les doublons

  const eyes = document.querySelectorAll('.eye');
  let angle = 0;

  eyeAnimationInterval = setInterval(() => {
    const offsetX = 30 + Math.sin(angle) * 20;
    const offsetY = 30 + Math.cos(angle) * 20;
    const config = emotionConfig[currentEmotion];

    eyes.forEach(eye => {
      eye.style.background = `radial-gradient(circle at ${offsetX}% ${offsetY}%, ${config.eye}, #000 70%)`;
    });

    angle += 0.1;
  }, emotionConfig[currentEmotion].speed);
}

export {
  currentEmotion,
  emotionConfig,
  updateEmotion,
  animateEyes
};
