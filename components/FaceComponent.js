export function FaceComponent() {
    const face = document.createElement('div');
    face.className = 'robot-face';

    const robotsWrapper = document.createElement('div');
    robotsWrapper.className = 'robots-wrapper';
    robotsWrapper.appendChild(RobertComponent());
    robotsWrapper.appendChild(MoniqueComponent());
    face.appendChild(robotsWrapper);

    const hardware = document.createElement('div');
    hardware.className = 'hardware-schema';
    hardware.innerHTML = `
        <div class="component pulsing" style="color: #0f0;">
            [Pi 5] ← [CAN] → [Arduino]
        </div>
        <div class="component">
            Servos: <span id="servoXValue">90</span>° | <span id="servoYValue">90</span>°
        </div>
        <div class="component pulsing" style="color: #00f;">
            Whisper.cpp ←Audio→ Piper
        </div>
    `;
    face.appendChild(hardware);

    const chat = document.createElement('div');
    chat.className = 'chat-container';
    chat.innerHTML = `
        <div id="chatLog"></div>
        <input type="text" id="userInput" placeholder="Parler au robot...">
        <button id="sendButton">Envoyer</button>
    `;
    face.appendChild(chat);

    return face;
}

