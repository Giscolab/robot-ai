export function TerminalComponent() {
    const container = document.createElement('div');
    container.className = 'control-panel';

    container.innerHTML = `
        <h3>Terminal Robotique (SSH simulé)</h3>
        <div id="terminal" contenteditable="true"></div>
        <div id="terminal-autocomplete"></div>
        <button id="runCommandButton">Exécuter</button>
    `;

    return container;
}
