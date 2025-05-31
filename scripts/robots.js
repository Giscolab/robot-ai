// ================= IMPORTS =================
import { initWaveComponent, updateWaveColor, hookSetEmotion } from './core/WaveComponent.js';

// ================= CONFIGURATION =================
const EMOTIONS = {
  neutral: { color: '#00aaff', blinkRate: 4000, text: 'Neutre', emoji: '😐' },
  happy: { color: '#8bc34a', blinkRate: 2500, text: 'Heureuse', emoji: '😊' },
  angry: { color: '#ff0000', blinkRate: 1000, text: 'Colère', emoji: '😠' },
  sleepy: { color: '#4a90e2', blinkRate: 6000, text: 'Endormie', emoji: '😴' },
  curious: { color: '#ffeb3b', blinkRate: 2000, text: 'Curieuse', emoji: '🤔' },
  inLove: { color: '#ff69b4', blinkRate: 3500, text: 'Amoureuse', emoji: '😍' },
  excited: { color: '#ff5722', blinkRate: 1500, text: 'Excitée', emoji: '🤩' },
  proud: { color: '#ffd700', blinkRate: 3000, text: 'Fière', emoji: '🦚' },
  surprised: { color: '#fff200', blinkRate: 800, text: 'Surprise', emoji: '😲' },
  nostalgic: { color: '#b39ddb', blinkRate: 6500, text: 'Nostalgique', emoji: '😌' },
  wary: { color: '#795548', blinkRate: 1200, text: 'Méfiante', emoji: '🧐' },
  mischievous: { color: '#9c27b0', blinkRate: 2400, text: 'Malicieuse', emoji: '😏' },
  jealous: { color: '#4caf50', blinkRate: 1800, text: 'Jalouse', emoji: '😒' },
  anxious: { color: '#ff8c00', blinkRate: 3600, text: 'Anxieuse', emoji: '😖' },
  disgusted: { color: '#8b4513', blinkRate: 3200, text: 'Dégoutée', emoji: '🤢' },
  hacker: { color: '#39ff14', blinkRate: 500, text: 'Hacker', emoji: '🎮' },
  overheated: { color: '#8b0000', blinkRate: 1300, text: 'Surchauffe', emoji: '🥵' }
};

// ================= ÉLÉMENTS DOM =================
const robertEyes = document.querySelectorAll('#robotRobert .eye');
const robotRobert = document.getElementById('robotRobert');
const moniqueEyes = document.querySelectorAll('#robotMonique .eye');
const moniquePupils = document.querySelectorAll('#robotMonique .pupil');
const moniqueEmotionLabel = document.getElementById('moniqueEmotionLabel');
const moniqueEmotionLog = document.getElementById('moniqueEmotionLog');
const robotMonique = document.getElementById('robotMonique');
const emotionButtons = document.querySelectorAll('.controls button');

// ================= ÉTAT GLOBAL =================
let currentEmotion = 'neutral';
let moniqueBlinkTimer;
let emotionHistory = [];
let emoIndex = 0;
let autoCycle;

// ================= FONCTIONS CORE =================
function logSystem(message) {
  const log = document.getElementById('systemLog');
  if (!log) return;
  
  log.textContent += `\n${message}`;
  log.scrollTop = log.scrollHeight;
}

function robertBlink() {
  robertEyes.forEach(eye => eye.classList.add('closed'));
  setTimeout(() => robertEyes.forEach(eye => eye.classList.remove('closed')), 200);
  logSystem('Robert a cligné des yeux 👀');
}

function moniqueBlink() {
  moniqueEyes.forEach(eye => eye.classList.add('closed'));
  moniquePupils.forEach(pupil => pupil.classList.add('closed'));
  setTimeout(() => {
    moniqueEyes.forEach(eye => eye.classList.remove('closed'));
    moniquePupils.forEach(pupil => pupil.classList.remove('closed'));
  }, 200);
}

// ================= GESTION ÉMOTIONS =================
function updateEmotionLog(config) {
  const now = new Date();
  const logEntry = document.createElement('span');
  logEntry.textContent = `[${now.toLocaleTimeString()}] ${config.text} ${config.emoji}`;
  
  moniqueEmotionLog.prepend(logEntry);
  emotionHistory.unshift(logEntry);
  
  while (moniqueEmotionLog.children.length > 3) {
    moniqueEmotionLog.removeChild(moniqueEmotionLog.lastChild);
    emotionHistory.pop();
  }
}

function applyEmotionEffects(config) {
  robotMonique.style.transform = 'rotate(5deg)';
  setTimeout(() => {
    robotMonique.style.transform = 'rotate(-5deg)';
    setTimeout(() => robotMonique.style.transform = 'rotate(0)', 100);
  }, 100);

  clearInterval(moniqueBlinkTimer);
  moniqueBlinkTimer = setInterval(moniqueBlink, config.blinkRate);
}

function setEmotion(emotion) {
  if (!EMOTIONS[emotion] || emotion === currentEmotion) return;
  
  const config = EMOTIONS[emotion];
  currentEmotion = emotion;

  moniqueEyes.forEach(eye => eye.style.setProperty('--iris-color', config.color));
  moniqueEmotionLabel.innerHTML = `Émotion : ${config.text} ${config.emoji}`;
  
  logSystem(`Monique: ${config.text} ${config.emoji}`);
  updateEmotionLog(config);
  applyEmotionEffects(config);

  emotionButtons.forEach(btn => 
    btn.classList.toggle('active', btn.dataset.emotion === emotion)
  );
}

// ================= INITIALISATION =================
function initAnimations() {
  // Configuration Robert
  setInterval(robertBlink, 3000 + Math.random() * 3000);
  setInterval(() => {
    robotRobert.style.transform = `rotate(${(Math.random() * 20 - 10)}deg)`;
  }, 2500 + Math.random() * 3000);

  // Configuration Monique
  setInterval(() => {
    robotMonique.style.transform = `rotate(${(Math.random() * 15 - 7.5)}deg)`;
  }, 3000 + Math.random() * 4000);
}

function initEventListeners() {
  emotionButtons.forEach(button => 
    button.addEventListener('click', () => setEmotion(button.dataset.emotion))
  );

  document.addEventListener('keydown', e => {
    const keyNum = parseInt(e.key);
    if (keyNum >= 1 && keyNum <= 5) setEmotion(emotionButtons[keyNum - 1].dataset.emotion);
  });

  // Cycle automatique initial
  autoCycle = setInterval(() => {
    emoIndex = (emoIndex + 1) % Object.keys(EMOTIONS).length;
    setEmotion(Object.keys(EMOTIONS)[emoIndex]);
  }, 8000);

  // Désactivation du cycle
  const disableEvents = ['click', 'keydown'];
  disableEvents.forEach(event => 
    document.addEventListener(event, () => clearInterval(autoCycle), { once: true })
  );
}

// ================= API PUBLIQUE =================
export const remoteRobertBlink = () => {
  robertEyes.forEach(eye => {
    eye.classList.add('closed');
    setTimeout(() => eye.classList.remove('closed'), 200);
  });
  
  logSystem(`[${new Date().toLocaleTimeString()}] Robert (remote) a cligné des yeux 👁️`);
};

export const remoteSetMoniqueEmotion = (emotion) => {
  if (!EMOTIONS[emotion]) return;
  
  const config = EMOTIONS[emotion];
  currentEmotion = emotion;

  moniqueEyes.forEach(eye => 
    eye.style.setProperty('--iris-color', config.color)
  );

  if (moniqueEmotionLabel) {
    moniqueEmotionLabel.innerHTML = `Émotion : ${config.text} ${config.emoji}`;
  }

  clearInterval(window._remoteBlinkTimer);
  window._remoteBlinkTimer = setInterval(() => {
    moniqueEyes.forEach(e => {
      e.classList.add('closed');
      setTimeout(() => e.classList.remove('closed'), 120);
    });
  }, config.blinkRate);
};

// ================= KONAMI CODE ADMIN =================
let konamiSequence = [];
const KONAMI_CODE = [38,38,40,40,37,39,37,39,66,65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', (e) => {
  konamiSequence.push(e.keyCode);
  if (konamiSequence.length > KONAMI_CODE.length) konamiSequence.shift();
  
  if (konamiSequence.join() === KONAMI_CODE.join()) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="adminPanel" style="position:fixed;bottom:0;right:0;background:#111;color:#0f0;padding:10px;border:1px solid #0f0;z-index:9999;font-family:monospace;">
        🛠 MODE ADMIN ACTIVÉ | ${new Date().toLocaleTimeString()}
      </div>
    `);
    
    logSystem('🛡️ Accès Admin activé via Konami Code');
    setEmotion('hacker');
    
    // Feedback visuel spécial
    document.body.style.animation = 'flashAdmin 0.5s 3';
    setTimeout(() => document.body.style.animation = '', 1500);
    
    // Réinitialisation du code
    konamiSequence = [];
  }
});


// ================= DÉMARRAGE =================
initWaveComponent('robotRobert');
initWaveComponent('robotMonique');
initAnimations();
initEventListeners();
setEmotion('neutral');

// Optimisations GPU
document.querySelectorAll('.eye').forEach(e => 
  e.style.transform = 'translateZ(0.01px)'
);
document.querySelector('#robotMonique .head')?.style?.setProperty(
  'transform', 
  'translateZ(0.01px)'
);