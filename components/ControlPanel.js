export function ControlPanel() {
    const container = document.createElement('div');
    container.className = 'control-panel';

    container.innerHTML = `
        <h3>Contrôle du système</h3>
        <div class="status-led"></div>

        <div class="servo-control">
            <label>Mouvement tête:</label>
            <input type="range" id="servoX" min="0" max="180" value="90">
            <input type="range" id="servoY" min="0" max="180" value="90">
        </div>

        <div class="servo-control">
            <label>Émotion:</label>
            <select id="emotionSelect">
                <option value="neutral">Neutre</option>
                <option value="happy">Heureux</option>
                <option value="angry">Colère</option>
                <option value="curious">Curieux</option>
                <option value="sleepy">Endormi</option>
            </select>
        </div>

        <div class="servo-control">
            <label>Log système:</label>
            <pre id="systemLog"></pre>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <span class="websocket-status" id="wsStatus"></span>
            <button id="wsToggleButton">WebSocket: OFF</button>
        </div>

        <div class="energy-bar" id="energyConsumption">
            <div style="width: 50%; height: 100%; background: #0f0; border-radius: 10px;"></div>
        </div>

        <div class="chart-container">
            <canvas id="energyChart"></canvas>
        </div>
        <div id="batteryStatus"></div>
    `;

    return container;
}
