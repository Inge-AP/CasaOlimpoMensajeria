import puppeteer, { Browser, Page } from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import AutoCleanupManager from './AutoCleanupManager';
import { resolve } from 'path';
import { rejects } from 'assert';

const execAsync = promisify(exec);


class BrowserManager {
    private static instance: BrowserManager;
    private browser: Browser | null = null;
    private isLaunching: boolean = false;
    private isClosing: boolean = false;
    private launchAttempts: number = 0;
    private readonly maxLaunchAttempts = 5;
    private autoCleanup: AutoCleanupManager;
    private restartTimer: NodeJS.Timeout | null = null;
    private activeSessions: Set<string> = new Set();

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
            if (this.activeSessions.size === 0){
                const memoryUsage = process.memoryUsage();
                if(memoryUsage.heapUsed > 800 * 1024 * 1024) {
                    await this.restartBrowser();
                }
            }
        }, 14400000);
    }

    private async safeClenaup(): Promise<void> {
        try {
            if (process.platform === 'linux') {
                await execAsync('timeout 10 pkill -TERM chromium 2>/dev/null || true');
                await new Promise(resolve => setTimeout(resolve, 2000));
                await execAsync('timeout 5 pkill -KILL chromium 2>/dev/null || true');

                const lockFiles = [
                    '/root/snap/chromium/common/chromium/SingletonLock',
                    '/tmp/.com.google.Chrome.*',
                    '/tmp/.org.chromium.Chromium.*'
                ];

                for (const pattern of lockFiles) {
                    await execAsync(`find ${pattern.includes('*') ? '/tmp' : '/root'} -name "${pattern.split('/').pop()}" -delete 2>/dev/null || true`);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
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
            '--disable-component-update',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=VizDisplayCompositor,VizHitTestSurfaceLayer'
        ];

        const config: any = {
            headless: true,
            args,
            defaultViewport: { width: 1366, height: 768},
            timeout: 120000,
            ignoreDefaultArgs: ['--disable-extensions'],
            handleSIGINT: false,
            handleSIGTERM: false,
            handleSIGHUP: false,
            ignoreHTTPSErrors: true,
            devtools: false
        };

        if (process.env.NODE_ENV === 'production' && process.env.PUPPETEER_EXECUTALE_PATH) {
            config.executablePath = process.env.PUPPETEER_EXECUTALE_PATH;
        }

        return config;
    }


    async getBrowser(): Promise<Browser> {
        if (this.isClosing) {
            while (this.isClosing) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (this.browser && this.browser.isConnected()) {
            try {
                const pages = await Promise.race([
                    this.browser.pages(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]) as Page[];
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
            await this.safeClenaup();

            const config = this.getBrowserConfig();
            this.browser = await puppeteer.launch(config);

            this.browser.on('disconnected', async () => {
                if(!this.isClosing) {
                    this.browser = null;
                    if (this.activeSessions.size > 0) {
                        setTimeout(async () => {
                            try {
                                await this.getBrowser();
                            } catch (error) {
                                console.log('Error en auto-relanzamiento', error.message);
                            }
                        }, 5000);
                    }
                }
            });

            this.browser.on('targetcreated', (target) => {
                console.log(`🎯 Nueva pestaña creada: ${target.type()}`);
            });

            this.browser.on('targetdestroyed', (target) => {
                console.log(`🗑️ Pestaña cerrada: ${target.type()}`);
            });

            this.browser.on('error', (error) => {
                console.error('❌ Error en el navegador:', error.message);
            });

            setInterval(async () => {
                if (this.browser && this.browser.isConnected() && !this.isClosing) {
                    try {
                        const pages = await this.browser.pages();
                        if (pages.length > 20) {
                            for (let i = 15; i < pages.length; i++) {
                                try {
                                    const url = pages[i].url();
                                    if (!url.includes('web.whatsapp.com')) {
                                        await pages[i].close();
                                    }
                                } catch (pageError) {
                                    
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
                await new Promise(resolve => setTimeout(resolve, 15000));
                return this.launchBrowser();
            }

            await new Promise(resolve => setTimeout(resolve, 500 * this.launchAttempts));
            return this.launchBrowser();
        }
    }

    async closeBrowser(): Promise<void> {
        if (this.browser && !this.isClosing) {
            this.isClosing = true;
            try {
                const pages = await this.browser.pages();
                for (const page of pages) {
                    try {
                        if (!page.isClosed()) {
                            await page.close();
                        }
                    } catch (error) {

                    }
                }
                await this.browser.close();
                this.browser = null;
            } catch (error) {
                this.browser = null;
            } finally {
                this.isClosing = false;
            }
        }
    }

    async restartBrowser(): Promise<Browser> {
        console.log('🔄 Reiniciando navegador automáticamente...');
        await this.closeBrowser();
        await this.safeClenaup();
        await new Promise(resolve => setTimeout(resolve, 3000));
        return this.getBrowser();
    }

    async healthCheck(): Promise<boolean> {
        try {
            if (!this.browser || !this.browser.isConnected() || this.isClosing) {
                return false;
            }
            const pages = await Promise.race([
                this.browser.pages(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]) as Page[];
            return pages.length >= 0;
        } catch (error) {
            return false;
        }
    }

    registerSession(sessionId: string): void {
        this.activeSessions.add(sessionId);
        console.log(`📱 Sesión registrada: ${sessionId} (Total: ${this.activeSessions.size})`);
    }

    // Método para desregistrar sesiones
    unregisterSession(sessionId: string): void {
        this.activeSessions.delete(sessionId);
        console.log(`📱 Sesión eliminada: ${sessionId} (Total: ${this.activeSessions.size})`);
    }

    getActiveSessionsCount(): number {
        return this.activeSessions.size;
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