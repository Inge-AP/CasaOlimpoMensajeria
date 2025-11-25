import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { formatPhoneNumberForWhatsApp } from "../utils/phoneNumberUtil";
import path from "path";

export class WhatsappWebSession {
  public client: Client;
  private isReady: boolean = false;

  constructor(
    sessionId: string,
    qrGenerationCallback: (qr: string) => void,
    readyInstaceCallback: (sessionId: string) => void
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: path.join(__dirname, "../../.wwebjs_auth"),
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-resources',
          '--disable-extensions',
          '--disable-blink-features=AutomationControlled',
          '--disable-default-apps',
          '--disable-translate',
          '--disable-sync',
          '--metrics-recording-only',
          '--disable-background-networking',
          '--disable-preconnect',
          '--disable-hang-monitor',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-media-session-api',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-default-apps',
          '--disable-sync-types',
        ],
      }
    });

    this.client.on("qr", qrGenerationCallback);
    this.client.on("ready", () => {
      this.isReady = true;
      console.log(`Sesión ${sessionId} lista`);
      readyInstaceCallback(sessionId);
    });
    this.client.on("message_create", this.onMessageCreate.bind(this));
    this.client.on("error", this.onError.bind(this));
    this.client.on("auth_failure", this.onAuthFailure.bind(this));
    this.client.on("disconnected", this.onDisconnected.bind(this));

    this.client.initialize().catch(err => {
      console.error("Error inicializando cliente para sesión", sessionId, err);
    });
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

  private onDisconnected() {
    console.log("Cliente desconectado");
    this.isReady = false;
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
