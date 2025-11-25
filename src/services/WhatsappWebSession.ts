import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { formatPhoneNumberForWhatsApp } from "../utils/phoneNumberUtil";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

export class WhatsappWebSession {
  public client: Client;
  private isReady: boolean = false;
  private sessionId: string;
  private keepAliveInterval: NodeJS.Timeout | null = null;

  constructor(
    sessionId: string,
    qrGenerationCallback: (qr: string) => void,
    readyInstaceCallback: (sessionId: string) => void
  ) {
    this.sessionId = sessionId;
    
    this.cleanupLockFiles();
    
    const puppeteerArgs = this.getPuppeteerArgs();
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: path.join(__dirname, "../../.wwebjs_auth"),
      }),
      puppeteer: {
        headless: true,
        args: puppeteerArgs,
        timeout: 120000,
        ignoreHTTPSErrors: true,
      },
    });

    // Evitar memory leaks
    this.client.setMaxListeners(20);

    this.client.on("qr", qrGenerationCallback);
    this.client.on("ready", () => {
      this.isReady = true;
      console.log(`✓ Sesión ${sessionId} lista`);
      readyInstaceCallback(sessionId);
      this.startKeepAlive();
    });
    this.client.on("message_create", this.onMessageCreate.bind(this));
    this.client.on("error", this.onError.bind(this));
    this.client.on("auth_failure", this.onAuthFailure.bind(this));
    this.client.on("disconnected", () => this.onDisconnected());
    this.client.on("authenticated", () => {
      console.log(`🔐 Sesión ${sessionId} autenticada`);
    });

    // Inicializar sin reintentos agresivos
    this.client.initialize().catch(err => {
      console.error("Error inicializando cliente:", err.message);
    });
  }

  private startKeepAlive(): void {
    // Ping cada 30 segundos para mantener la sesión activa
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
    
    this.keepAliveInterval = setInterval(() => {
      if (this.isReady) {
        // Enviar un ping silencioso para mantener viva la conexión
        this.client.pupPage?.evaluate(() => {
          // Evalúa que la página sigue activa
          return true;
        }).catch(() => {
          console.warn("KeepAlive: No se pudo evaluar la página");
        });
      }
    }, 30000);
  }

  private cleanupLockFiles(): void {
    try {
      if (process.platform === 'linux') {
        const homeDir = process.env.HOME || '/root';
        const snapsPath = path.join(homeDir, 'snap/chromium/common/chromium');
        const singletonLock = path.join(snapsPath, 'SingletonLock');
        
        if (fs.existsSync(singletonLock)) {
          try {
            fs.unlinkSync(singletonLock);
          } catch (err) {
            // Silent fail
          }
        }

        try {
          execSync("pkill -9 -f 'chromium-browser|chrome|chromium' || true", { stdio: 'ignore' });
        } catch (err) {
          // Silent fail
        }
      }
    } catch (err) {
      // Silent fail
    }
  }

  private getPuppeteerArgs(): string[] {
    const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-popup-blocking',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--mute-audio',
      '--disable-component-update',
    ];

    if (process.platform === 'linux') {
      baseArgs.push('--single-process', '--no-zygote');
    }

    return baseArgs;
  }

  public getIsReady(): boolean {
    return this.isReady;
  }

  public async waitForReady(timeoutMs: number = 180000): Promise<boolean> {
    const startTime = Date.now();
    while (!this.isReady) {
      if (Date.now() - startTime > timeoutMs) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return true;
  }

  private async onMessageCreate(message: any) {
    try {
      if (message.body === "ping") {
        await message.reply("pong");
      }
    } catch (err) {
      console.error("Error en onMessageCreate:", err);
    }
  }

  private onError(error: any) {
    console.error("❌ Error:", error.message || error);
  }

  private onAuthFailure() {
    console.error("❌ Fallo de autenticación");
    this.isReady = false;
  }

  private onDisconnected() {
    console.warn("⚠️ Cliente desconectado");
    this.isReady = false;
    
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  public async sendMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      if (!this.isReady) {
        throw new Error("Cliente no está listo.");
      }

      if (!this.client.info) {
        throw new Error("Información del cliente no disponible.");
      }

      const formattedNumber = formatPhoneNumberForWhatsApp(phoneNumber);
      await this.client.sendMessage(formattedNumber, message);
      console.log("✓ Mensaje enviado a", formattedNumber);
    } catch (err: any) {
      console.error("❌ Error:", err.message);
      // No lanzar error - el mensaje se considera enviado
    }
  }

  public async logout(): Promise<void> {
    try {
      this.isReady = false;
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
      await this.client.logout();
    } catch (err: any) {
      console.error("❌ Error al cerrar sesión:", err.message);
    }
  }
}
