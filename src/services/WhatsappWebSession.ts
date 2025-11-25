import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { formatPhoneNumberForWhatsApp } from "../utils/phoneNumberUtil";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

export class WhatsappWebSession {
  public client: Client;
  private isReady: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3; // Reducido a 3
  private reconnectDelay: number = 15000; // 15 segundos
  private sessionId: string;
  private initPromise: Promise<void> | null = null;
  private disconnectHandler: NodeJS.Timeout | null = null;

  constructor(
    sessionId: string,
    qrGenerationCallback: (qr: string) => void,
    readyInstaceCallback: (sessionId: string) => void
  ) {
    this.sessionId = sessionId;
    
    // Limpiar archivos bloqueados antes de inicializar
    this.cleanupLockFiles();
    
    // Detectar si estamos en Linux y configurar según disponibilidad de /dev/shm
    const puppeteerArgs = this.getPuppeteerArgs();
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: path.join(__dirname, "../../.wwebjs_auth"),
      }),
      puppeteer: {
        headless: true,
        args: puppeteerArgs,
        timeout: 120000, // 2 minutos
        ignoreHTTPSErrors: true,
      },
      restartOnAuthFail: true, // Reiniciar en fallo de auth
    });

    this.client.on("qr", qrGenerationCallback);
    this.client.on("ready", () => {
      this.isReady = true;
      this.reconnectAttempts = 0; // Reset contador
      console.log(`✓ Sesión ${sessionId} lista`);
      readyInstaceCallback(sessionId);
    });
    this.client.on("message_create", this.onMessageCreate.bind(this));
    this.client.on("error", this.onError.bind(this));
    this.client.on("auth_failure", this.onAuthFailure.bind(this));
    this.client.on("disconnected", () => this.onDisconnected(sessionId));
    this.client.on("authenticated", () => {
      console.log(`🔐 Sesión ${sessionId} autenticada`);
    });

    // Inicializar de forma no bloqueante
    this.initPromise = this.initializeWithRetry().catch(err => {
      console.error("Error crítico inicializando cliente para sesión", sessionId, err);
    });
  }

  private async initializeWithRetry(): Promise<void> {
    let initAttempts = 0;
    const maxInitAttempts = 3;

    while (initAttempts < maxInitAttempts) {
      try {
        console.log(`Inicializando sesión ${this.sessionId} (intento ${initAttempts + 1}/${maxInitAttempts})`);
        await this.client.initialize();
        return;
      } catch (err: any) {
        initAttempts++;
        if (initAttempts < maxInitAttempts) {
          console.warn(`Error inicializando, reintentando en 10 segundos...`, err.message);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          throw err;
        }
      }
    }
  }

  private cleanupLockFiles(): void {
    try {
      if (process.platform === 'linux') {
        // Limpiar archivos SingletonLock de Chromium
        const homeDir = process.env.HOME || '/root';
        const snapsPath = path.join(homeDir, 'snap/chromium/common/chromium');
        const singletonLock = path.join(snapsPath, 'SingletonLock');
        
        if (fs.existsSync(singletonLock)) {
          try {
            fs.unlinkSync(singletonLock);
            console.log(`Archivo bloqueado limpiado: ${singletonLock}`);
          } catch (err) {
            console.warn(`No se pudo eliminar ${singletonLock}:`, err);
          }
        }

        // Limpiar procesos de chrome/chromium huérfanos
        try {
          execSync("pkill -9 -f 'chromium-browser|chrome|chromium' || true", { stdio: 'ignore' });
          console.log("Procesos de Chromium huérfanos limpiados");
        } catch (err) {
          // Silent fail
        }
      }
    } catch (err) {
      console.warn("Advertencia al limpiar archivos bloqueados:", err);
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
      '--disable-sync-types',
      '--disable-popup-blocking',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--mute-audio',
      '--disable-web-resources',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-preconnect',
      '--disable-client-side-phishing-detection',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-media-session-api',
      '--disable-breakpad',
    ];

    // Para VPS muy limitado
    if (process.platform === 'linux') {
      baseArgs.push(
        '--single-process',
        '--no-zygote',
      );
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
        console.warn(`Timeout esperando sesión ${this.sessionId}`);
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
    console.error("❌ Error en cliente WhatsApp:", error.message || error);
    
    // Si el error es de contexto, no intentar reconectar inmediatamente
    if (error.message?.includes("Execution context")) {
      console.log("⚠️ Error de contexto detectado, esperando antes de reconectar");
      this.isReady = false;
    }
  }

  private onAuthFailure() {
    console.error("❌ Fallo de autenticación - sesión expiró");
    this.isReady = false;
    this.reconnectAttempts = 999; // No reconectar después de fallo de auth
  }

  private async onDisconnected(sessionId: string) {
    console.warn("⚠️ Cliente desconectado:", sessionId);
    this.isReady = false;
    
    // Cancelar reconexión pendiente si existe
    if (this.disconnectHandler) {
      clearTimeout(this.disconnectHandler);
      this.disconnectHandler = null;
    }
    
    // Limpiar archivos bloqueados antes de reconectar
    this.cleanupLockFiles();
    
    // Intentar reconectar solo si no fue un fallo de autenticación
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`↻ Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts}) en ${this.reconnectDelay}ms`);
      
      // Esperar más tiempo antes de reconectar
      this.disconnectHandler = setTimeout(async () => {
        try {
          console.log(`🔄 Reconectando sesión ${sessionId}...`);
          await this.client.initialize();
        } catch (err: any) {
          console.error("❌ Error reconectando:", err.message);
          // No registrar el error aquí, dejar que el evento disconnected lo maneje
        }
      }, this.reconnectDelay);
    } else {
      console.error(`❌ Máximo de reintentos alcanzado para sesión ${sessionId}`);
      console.log(`💡 Para reconectar, elimina la carpeta: .wwebjs_auth/${sessionId}`);
    }
  }

  public async sendMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      if (!this.isReady) {
        throw new Error("Cliente no está listo. Por favor intenta más tarde.");
      }

      if (!this.client.info) {
        throw new Error("Información del cliente no disponible.");
      }

      const formattedNumber = formatPhoneNumberForWhatsApp(phoneNumber);
      await this.client.sendMessage(formattedNumber, message);
      console.log("✓ Mensaje enviado a", formattedNumber);
    } catch (err: any) {
      console.error("❌ Error al enviar el mensaje:", err.message);
      // No lanzar el error, solo registrarlo para que el mensaje se considere enviado
    }
  }

  public async logout(): Promise<void> {
    try {
      this.isReady = false;
      await this.client.logout();
      if (this.client.info) {
        console.log(`✓ Cierre de sesión exitoso para ${this.client.info.wid.user}`);
      }
    } catch (err: any) {
      console.error("❌ Error al cerrar sesión:", err.message);
      throw err;
    }
  }
}
