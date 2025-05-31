export function log(message) {
  const logElement = document.getElementById('systemLog');
  if (!logElement) return;

  const timestamp = new Date().toLocaleTimeString();
  const fullMessage = `[${timestamp}] ${message}\n`;

  logElement.textContent += fullMessage;

  // Limite à 200 lignes max (ajustable)
  const maxLines = 200;
  const lines = logElement.textContent.split('\n');

  if (lines.length > maxLines) {
    // Coupe les lignes les plus anciennes
    logElement.textContent = lines.slice(lines.length - maxLines).join('\n');
  }

  logElement.scrollTop = logElement.scrollHeight;
}
