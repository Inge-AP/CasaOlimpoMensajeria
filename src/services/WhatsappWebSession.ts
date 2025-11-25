import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { formatPhoneNumberForWhatsApp } from "../utils/phoneNumberUtil";
import path from "path";
import fs from "fs";

export class WhatsappWebSession {
  public client: Client;
  private isReady: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000; // 5 segundos

  constructor(
    sessionId: string,
    qrGenerationCallback: (qr: string) => void,
    readyInstaceCallback: (sessionId: string) => void
  ) {
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
        timeout: 60000,
      }
    });

    this.client.on("qr", qrGenerationCallback);
    this.client.on("ready", () => {
      this.isReady = true;
      this.reconnectAttempts = 0; // Reset contador
      console.log(`Sesión ${sessionId} lista`);
      readyInstaceCallback(sessionId);
    });
    this.client.on("message_create", this.onMessageCreate.bind(this));
    this.client.on("error", this.onError.bind(this));
    this.client.on("auth_failure", this.onAuthFailure.bind(this));
    this.client.on("disconnected", () => this.onDisconnected(sessionId));

    this.client.initialize().catch(err => {
      console.error("Error inicializando cliente para sesión", sessionId, err);
    });
  }

  private getPuppeteerArgs(): string[] {
    const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-web-resources',
      '--disable-extensions',
      '--disable-blink-features=AutomationControlled',
      '--disable-sync',
      '--disable-popup-blocking',
      '--no-first-run',
      '--no-default-browser-check',
    ];

    // Verificar si estamos en un VPS con /dev/shm limitado
    const isLimitedSHM = this.hasLimitedSHM();
    
    if (isLimitedSHM) {
      console.log("Detectado /dev/shm limitado, deshabilitando...");
      baseArgs.push('--disable-dev-shm-usage');
    } else {
      // Si /dev/shm está disponible, podemos usar más optimizaciones
      baseArgs.push('--disable-dev-shm-usage'); // Aún así deshabilitarlo para VPS es más seguro
    }

    return baseArgs;
  }

  private hasLimitedSHM(): boolean {
    try {
      // En Linux, verificar tamaño de /dev/shm
      if (process.platform === 'linux') {
        const stats = fs.statfsSync('/dev/shm');
        const availableMB = (stats.bavail * stats.bsize) / (1024 * 1024);
        console.log(`/dev/shm disponible: ${availableMB.toFixed(2)}MB`);
        return availableMB < 100; // Si tiene menos de 100MB, es limitado
      }
    } catch (err) {
      console.log("No se pudo verificar /dev/shm, asumiendo limitado");
      return true;
    }
    return false;
  }

  public getIsReady(): boolean {
    return this.isReady;
  }

  public async waitForReady(timeoutMs: number = 120000): Promise<boolean> {
    const startTime = Date.now();
    while (!this.isReady) {
      if (Date.now() - startTime > timeoutMs) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
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
    console.error("Error en cliente WhatsApp: ", error);
  }

  private onAuthFailure() {
    console.error("Fallo de autenticación");
    this.isReady = false;
  }

  private async onDisconnected(sessionId: string) {
    console.log("Cliente desconectado:", sessionId);
    this.isReady = false;
    
    // Intentar reconectar
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts}) en ${this.reconnectDelay}ms`);
      setTimeout(() => {
        this.client.initialize().catch(err => {
          console.error("Error reconectando:", err);
        });
      }, this.reconnectDelay);
    } else {
      console.error(`Máximo de reintentos alcanzado para sesión ${sessionId}`);
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
      console.log("Mensaje enviado a", formattedNumber);
    } catch (err: any) {
      console.error("Error al enviar el mensaje:", err.message);
      // No lanzar el error, solo registrarlo para que el mensaje se considere enviado
    }
  }

  public async logout(): Promise<void> {
    try {
      this.isReady = false;
      await this.client.logout();
      if (this.client.info) {
        console.log(`Cierre de sesión exitoso para ${this.client.info.wid.user}`);
      }
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err.message);
      throw err;
    }
  }
}
