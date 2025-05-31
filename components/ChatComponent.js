import { generateResponse } from '../scripts/modules/chat.js';

export function processCommand() {
  const inputField = document.getElementById('userInput');
  const chatLog = document.getElementById('chatLog');

  if (!inputField || !chatLog) return;

  const input = inputField.value.trim();
  if (!input) return;

  const response = generateResponse(input);

  chatLog.innerHTML += `
    <div class="message user-message"><strong>User:</strong> ${sanitize(input)}</div>
    <div class="message bot-message"><strong>Robot:</strong> ${sanitize(response)}</div>
  `;

  document.querySelectorAll('.eye').forEach(eye => {
    eye.style.transform = 'scale(1.2)';
    setTimeout(() => eye.style.transform = 'scale(1)', 200);
  });

  inputField.value = '';
  chatLog.scrollTop = chatLog.scrollHeight;
}

function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function ChatComponent() {
  const container = document.createElement('div');
  container.className = 'chat-container';
  container.innerHTML = `
    <div id="chatLog" class="log-output"></div>
    <input type="text" id="userInput" placeholder="Parler au robot...">
    <button id="sendButton">Envoyer</button>
  `;
  return container;
}
