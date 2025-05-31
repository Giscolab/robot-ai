export class RobotTerminal {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.commands = {
      help: () => this.getHelp(),
      clear: () => this.clearScreen(),
      uptime: () => this.formatUptime(),
      ls: () => this.listFiles(),
      tail: () => this.tailLog(),
      date: () => new Date().toString(),
      whoami: () => 'robot@local-ai:~$',
      echo: args => args.join(' ')
    };

    this.terminalElement = document.getElementById('terminal');
    this.autocompleteElement = document.getElementById('terminal-autocomplete');
    this.initTerminal();
  }

  initTerminal() {
    if (!this.terminalElement) return;

    this.terminalElement.addEventListener('keydown', (e) => this.handleKeyEvents(e));
    this.terminalElement.addEventListener('keyup', (e) => this.handleAutocomplete(e));
    this.terminalElement.setAttribute('contenteditable', true);
    this.terminalElement.focus();
    this.writePrompt();
  }

  writePrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'terminal-line';
    prompt.innerHTML = `<span class="prompt">robot@local-ai:~$</span> <span contenteditable="true" class="terminal-input"></span>`;
    this.terminalElement.appendChild(prompt);
    this.focusInput();
  }

  focusInput() {
    const inputs = this.terminalElement.querySelectorAll('.terminal-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }

  handleKeyEvents(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target;
      const command = input.textContent.trim();
      if (command !== '') {
        this.executeCommand(command);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateHistory(1);
    }
  }

  handleAutocomplete(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const input = e.target.textContent.trim();
      const suggestions = this.getSuggestions(input);
      if (suggestions.length === 1) {
        e.target.textContent = suggestions[0] + ' ';
        this.placeCaretAtEnd(e.target);
      } else if (suggestions.length > 1) {
        this.displayOutput('Suggestions: ' + suggestions.join('  '));
      }
    }
  }

  getSuggestions(partial) {
    return Object.keys(this.commands).filter(cmd => cmd.startsWith(partial));
  }

  placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;
    this.historyIndex = Math.max(Math.min(this.historyIndex + direction, this.history.length - 1), 0);
    const input = this.terminalElement.querySelector('.terminal-input:last-of-type');
    if (input) input.textContent = this.history[this.historyIndex];
  }

  executeCommand(command) {
    this.history.push(command);
    if (this.history.length > 200) this.history.shift();
    this.historyIndex = this.history.length;

    const [base, ...args] = command.split(' ');
    const result = this.commands[base]?.(args) || `<span class="terminal-error">Commande inconnue: ${base}</span>`;

    this.displayOutput(result);
    this.writePrompt();
  }

  displayOutput(output) {
    const outputLine = document.createElement('div');
    outputLine.className = 'terminal-line';
    outputLine.innerHTML = typeof output === 'string' ? output : JSON.stringify(output);
    this.terminalElement.appendChild(outputLine);
    outputLine.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  clearScreen() {
    this.terminalElement.innerHTML = '';
    this.writePrompt();
    return '';
  }

  getHelp() {
    return `
<pre>
Commandes disponibles :
- uptime      → état du système
- ls          → liste des fichiers
- tail        → afficher logs capteurs
- clear       → efface l’écran
- date        → date et heure actuelles
- whoami      → identité système
- echo [txt]  → répète un message
- help        → affiche cette aide
</pre>
    `;
  }

  formatUptime() {
    const d = Math.floor(Math.random() * 30);
    const h = Math.floor(Math.random() * 24);
    const m = Math.floor(Math.random() * 60);
    return `up ${d}d ${h}h ${m}m, load average: ${Math.random().toFixed(2)}`;
  }

  listFiles() {
    const files = ['config.yaml', 'motor_driver.fw', 'sensor_logs', 'README.md', 'energy.log'];
    return files.join('  ');
  }

  tailLog() {
    setTimeout(() => {
      const line = `[${new Date().toISOString()}] Capteur: ${(Math.random() * 5).toFixed(2)}V`;
      this.displayOutput(line);
    }, 800);
    return 'Début du suivi des logs...';
  }

  registerCommand(name, handler) {
    this.commands[name] = handler;
  }
}
