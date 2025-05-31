export let robertBlinkInterval, robertRotateInterval;

export function RobertComponent() {
  const robert = document.createElement('div');
  robert.className = 'robot-wrapper';
  robert.innerHTML = `
    <div class="robot robot-robert" id="robotRobert">
      <div class="head">
        <div class="eye" id="robertLeftEye"></div>
        <div class="eye" id="robertRightEye"></div>
      </div>
      <div class="body"></div>
      <div class="base"></div>
    </div>
    <h3 class="robot-title">🤖 Robert</h3>
  `;
  return robert;
}

export function initRobert() {
  const robot = document.getElementById('robotRobert');
  const robertEyes = robot ? robot.querySelectorAll('.eye') : [];

  if (!robertEyes.length || !robot) return;

  // Empêche les doublons si réinitialisé
  if (robertBlinkInterval) clearInterval(robertBlinkInterval);
  if (robertRotateInterval) clearInterval(robertRotateInterval);

  function blink() {
    robertEyes.forEach(e => e.classList.add('closed'));
    setTimeout(() => robertEyes.forEach(e => e.classList.remove('closed')), 200);
  }

  robertBlinkInterval = setInterval(blink, 3000 + Math.random() * 3000);

  let direction = 1;
  robertRotateInterval = setInterval(() => {
    const angle = direction * (10 + Math.random() * 10);
    robot.style.transform = `rotate(${angle}deg)`;
    direction *= -1;
  }, 2500 + Math.random() * 3000);
}
