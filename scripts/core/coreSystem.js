import EnergyMonitor from './EnergyMonitor.js';

const CoreSystem = (() => {
    let instance;
    const _private = {
        initialized: false,
        async loadConfig() {
            try {
                const response = await fetch('/config/system.json');
                if (!response.ok) throw new Error('Config load failed');
                return await response.json();
            } catch (error) {
                console.error('Critical config error:', error);
                throw error;
            }
        }
    };

    return {
        async getInstance() {
            if (!instance) {
                instance = {
                    auth: null,
                    modules: null,
                    config: null,
                    logger: null,
                    alerts: null,
                    monitoring: null,
                    api: null,
					energy: null,

                    async init() {
                        try {
                            // Initialisation séquentielle critique
                            this.config = await _private.loadConfig();
                            this.logger = new DataLogger(this.config.logging);
                            this.auth = new AuthManager(this.config.auth);
                            this.modules = new ModuleSystem(this.config.modules);
                            this.alerts = AlertSystem;
                            await this.alerts.init(this.config.alerts);
                            
                            // Initialisation des services connectés
                            this.monitoring = new MonitoringService(this.config.monitoring);
                            this.api = new ApiService(this.config.api);
                            
                            await this.modules.loadCoreModules();
                            _private.initialized = true;
                            this.logger.log('CoreSystem initialized');
                        } catch (error) {
                            console.error('CoreSystem initialization failed:', error);
                            throw new Error('Fatal system initialization error');
                        }
                    },

                    secureWS(endpoint) {
                        if (!_private.initialized) throw new Error('System not initialized');
                        return new WebSocket(
                            `${this.config.ws.baseUrl}/${endpoint}?token=${this.auth.getToken()}`
                        );
                    },

                    registerModule(name, module) {
                        if (this.modules.isRegistered(name)) {
                            this.logger.log(`Module ${name} already registered`, 'warning');
                            return;
                        }
                        this.modules.register(name, module);
                        this.logger.log(`Module ${name} registered`);
                    },

                    getService(serviceName) {
                        const service = this[serviceName] || this.modules.get(serviceName);
                        if (!service) throw new Error(`Service ${serviceName} not found`);
                        return service;
                    }
                };
            }
            return instance;
        }
    };
})();


(async () => {
    try {
        const system = await CoreSystem.getInstance();
        await system.init();
        
        // Enregistrement dynamique de modules
        system.registerModule('hardware', HardwareService);
        system.registerModule('robotics', RobotManager);
        
    } catch (error) {
        console.error('Application bootstrap failed:', error);
        // Gestion d'erreur de démarrage
    }
})();

export default CoreSystem;