import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path'

const execAsync = promisify(exec);

class AutoCleanupManager {
    private static instance: AutoCleanupManager;
    private cleanupInterval: NodeJS.Timeout | null = null;
    private isCleanupRunning: boolean = false;

    private constructor() {
        this.startAutoCleanup();
        this.setupProcessHandlers();
    }

    static getInstance(): AutoCleanupManager {
        if (!AutoCleanupManager.instance) {
            AutoCleanupManager.instance = new AutoCleanupManager();
        }
        return AutoCleanupManager.instance;
    }

    private setupProcessHandlers(): void {
        process.on('SIGINT', async () => {
            await this.forceCleanup();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await this.forceCleanup();
            process.exit(0);
        });
        process.on('exit', async () => {
            await this.forceCleanup();
            process.exit(0);
        });
        process.on('uncaughtException', async (error) => {
            console.error('Error no capturado:', error);
            await this.forceCleanup();
            process.exit(1);
        });
        process.on('unhandledRejection', async (reason, promise) => {
            console.error('Promesa rechazada:', reason);
            await this.emergencyCleanup();
        });
    }

    private startAutoCleanup(): void {
        this.cleanupInterval = setInterval(async () => {
            if (!this.isCleanupRunning) {
                await this.preventiveCleanup();
            }
        }, 300000);
        setTimeout(() => {
            this.preventiveCleanup();
        }, 5000);
    }

    async preventiveCleanup(): Promise<void> {
        if (this.isCleanupRunning) return;

        this.isCleanupRunning = true;
        try {
            await this.cleanupZombieProcesses();
            await this.cleanupLockFiles();
            await this.cleanupTempFiles();
        } catch (error) {
            console.log('Limpieza preventiva')
        } finally {
            this.isCleanupRunning = false;
        }
    }

    async forceCleanup(): Promise<void> {
        console.log('🧹 Ejecutando limpieza forzada...');
        try {
            await this.cleanupZombieProcesses();
            await this.cleanupLockFiles();
            await this.cleanupTempFiles();
            await this.cleanupUserDataDirs();
            console.log('✅ Limpieza forzada completada');
        } catch (error) {
            console.log('⚠️ Limpieza forzada completada con advertencias');
        }
    }

    async emergencyCleanup(): Promise<void> {
        try {
            if (process.platform === 'linux') {
                await execAsync('pkill -9 -f chromium 2>/dev/null || true')
                await execAsync('pkill -9 -f chrome 2>/dev/null || true')
                await execAsync('rm -rf /root/snap/chromium/common/chromium/SingletonLock 2>/dev/null || true')
                await execAsync('find /tmp -name "*chrome*" -type f -delete 2>/dev/null || true')
            }
        } catch (error) {
            
        }
    }

    private async cleanupZombieProcesses(): Promise<void> {
        try {
            if (process.platform === 'linux') {
                await execAsync('pkill -9 -f "chromium.*--type=" 2>/dev/null || true');
                await execAsync('pkill -9 -f "chrome.*--type=" 2>/dev/null || true');
                await execAsync('pkill -9 -f chromium-browser 2>/dev/null || true');

                await new Promise(resolve => setTimeout(resolve,2000));
            }
        } catch(error) {

        }
    }

    private async cleanupLockFiles(): Promise<void> {
        try {
            const lockPaths = [
                '/root/snap/chromium/common/chromium/SingletonLock',
                '/root/.config/chromium/SingletonLock',
                '/tmp/chromium-SingletonLock',
                '/var/tmp/chromium-SingletonLock'
            ];

            for (const lockPath of lockPaths) {
                await execAsync(`rm -rf "${lockPath}" 2>/dev/null || true`);
            }
        } catch (error) {
            
        }
    }

    private async cleanupTempFiles(): Promise<void> {
        try {
            await execAsync('find /tmp -name "*chrome*" -type f -mmin +5 -delete 2>/dev/null || true');
            await execAsync('find /tmp -name "*chromium*" -type f -mmin +5 -delete 2>/dev/null || true');
            await execAsync('find /tmp -name ".com.google.Chrome.*" -delete 2>/dev/null || true');
            await execAsync('find /tmp -name ".org.chromium.Chromium.*" -delete 2>/dev/null || true');
        } catch (error) {
            
        }
    }

    private async cleanupUserDataDirs(): Promise<void> {
        try {
            await execAsync('find /tmp -name "chrome-user-data-*" -type d -mmin +10 -exec rm -rf {} + 2>/dev/null || true');
        } catch (error) {
            
        }
    }

    stop(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

export default AutoCleanupManager;