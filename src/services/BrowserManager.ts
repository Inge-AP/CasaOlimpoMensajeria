import puppeteer, { Browser } from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import AutoCleanupManager from './AutoCleanupManager';
import { resolve } from 'path';

const execAsync = promisify(exec);


class BrowserManager {
    private static instance: BrowserManager;
    private browser: Browser | null = null;
    private isLaunching: boolean = false;
    private launchAttempts: number = 0;
    private readonly maxLaunchAttempts = 5;
    private autoCleanup: AutoCleanupManager;
    private restartTimer: NodeJS.Timeout | null = null;

    private constructor() {
        this.autoCleanup = AutoCleanupManager.getInstance();
        this.setupAutoRestart();
    }

    static getInstance(): BrowserManager {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }

    private setupAutoRestart(): void {
        this.restartTimer = setInterval(async () => {
            const memoryUsage = process.memoryUsage();
            if(memoryUsage.heapUsed > 800 * 1024 * 1024) {
                await this.restartBrowser();
            }
        }, 14400000);
    }

    private async instantCleanup(): Promise<void> {
        try {
            if (process.platform === 'linux') {
                await execAsync('pkill -9 -f chromium 2>/dev/null || true');
                await execAsync('pkill -9 -f chrome 2>/dev/null || true');
                await execAsync('rm -rf /root/snap/chromium/common/chromium/SingletonLock 2>/dev/null || true');
                await execAsync('rm -rf /tmp/.com.google.Chrome.* 2>/dev/null || true');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } catch (error) {
            console.warn('⚠️ Advertencia en limpieza instantánea:', error.message);
        }
    }

    private getBrowserConfig(): any {
        const timestamp = Date.now();
        const args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-crash-reporter',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            `--user-data-dir=/tmp/chrome-user-data-${timestamp}`,
            '--remote-debugging-port=0',
            '--disable-background-networking',
            '--disable-sync',
            '--metrics-recording-only',
            '--no-pings',
            '--safebrowsing-disable-auto-update',
            '--disable-component-update'
        ];

        const config: any = {
            headless: true,
            args,
            defaultViewport: { width: 1366, height: 768},
            timeout: 120000,
            ignoreDefaultArgs: ['--disable-extensions'],
            handleSIGINT: false,
            handleSIGTERM: false,
            handleSIGHUP: false
        };

        if (process.env.NODE_ENV === 'production' && process.env.PUPPETEER_EXECUTALE_PATH) {
            config.executablePath = process.env.PUPPETEER_EXECUTALE_PATH;
        }

        return config;
    }


    async getBrowser(): Promise<Browser> {
        if (this.browser && this.browser.isConnected()) {
            try {
                await this.browser.pages(); // Test de conectividad
                return this.browser;
            } catch (error) {
                console.log('🔄 Navegador desconectado, creando uno nuevo...');
                this.browser = null;
            }
        }

        if (this.isLaunching) {
            while (this.isLaunching) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            if (this.browser && this.browser.isConnected()) {
                return this.browser;
            }
        }

        return this.launchBrowser();
    }

    private async launchBrowser(): Promise<Browser> {
        this.isLaunching = true

        try {
            await this.instantCleanup();

            const config = this.getBrowserConfig();
            this.browser = await puppeteer.launch(config);

            this.browser.on('disconnected', async () => {
                this.browser = null;
                
                setTimeout(async () => {
                    try {
                        if (!this.browser) {
                            await this.getBrowser();
                        }
                    } catch (error) {
                        console.log('Error en auto-relanzamiento', error.message);
                    }
                }, 5000)
            });

            this.browser.on('targetcreated', (target) => {
                console.log(`🎯 Nueva pestaña creada: ${target.type()}`);
            });

            this.browser.on('targetdestroyed', (target) => {
                console.log(`🗑️ Pestaña cerrada: ${target.type()}`);
            });

            setInterval(async () => {
                if (this.browser && this.browser.isConnected()) {
                    try {
                        const pages = await this.browser.pages();
                        if (pages.length > 15) {
                            for (let i = 10; i < pages.length; i++) {
                                const url = pages[i].url();

                                if (!url.includes('web.whatsapp.com')) {
                                    await pages[i].close();
                                }
                            }
                        }
                    } catch (error) {
                        console.warn('⚠️ Advertencia en limpieza de páginas:', error.message);
                    }
                }
            }, 600000);

            this.launchAttempts = 0;
            this.isLaunching = false;

            return this.browser;
        } catch (error) {
            this.isLaunching = false;
            this.launchAttempts++;

            if (this.launchAttempts >= this.maxLaunchAttempts) {
                this.launchAttempts = 0;
                await this.autoCleanup.emergencyCleanup();
                await new Promise(resolve => setTimeout(resolve, 10000));
                return this.launchBrowser();
            }

            await new Promise(resolve => setTimeout(resolve, 500 * this.launchAttempts));
            return this.launchBrowser();
        }
    }

    async closeBrowser(): Promise<void> {
        if (this.browser) {
            try {
                await this.browser.close();
                this.browser = null;
            } catch (error) {
                this.browser = null;
            }
        }
    }

    async restartBrowser(): Promise<Browser> {
        console.log('🔄 Reiniciando navegador automáticamente...');
        await this.closeBrowser();
        await this.instantCleanup();
        return this.getBrowser();
    }

    async healthCheck(): Promise<boolean> {
        try {
            if (!this.browser || !this.browser.isConnected()) {
                return false;
            }
            await this.browser.pages();
            return true;
        } catch (error) {
            return false;
        }
    }

    destroy(): void {
        if (this.restartTimer) {
            clearInterval(this.restartTimer);
            this.restartTimer = null;
        }
        this.autoCleanup.stop();
    }
}

export default BrowserManager;