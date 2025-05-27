import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { formatPhoneNumberForWhatsApp } from "../utils/phoneNumberUtil";
import path from "path";

export class WhatsappWebSession {
  public client: Client;

  /**
   * Constructor para inicializar una sesión de WhatsApp Web.
   * @param sessionId - El ID de sesión para identificar la sesión.
   * @param qrGenerationCallback - Función de callback para manejar la generación del código QR.
   * @param readyInstaceCallback - Función de callback cuando la sesión está lista.
   */
  constructor(
    sessionId: string,
    qrGenerationCallback: (qr: string) => void,
    readyInstaceCallback: (sessionId: string) => void
  ) {
    this.client = new Client({
      webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
      // Estrategia de autenticación local con un ID de cliente y una ruta de datos.
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: path.join(__dirname, "../../.wwebjs_auth"),
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Configuración de eventos para manejar el QR, la preparación y los errores.
    this.client.on("qr", qrGenerationCallback);
    this.client.on("ready", () => readyInstaceCallback(sessionId));
    this.client.on("message_create", this.onMessageCreate);
    this.client.on("error", this.onError);

    // Inicializa el cliente de WhatsApp.
    this.client.initialize();
  }

  /**
   * Maneja la creación de mensajes.
   * @param message - El mensaje que se ha creado.
   */
  private async onMessageCreate(message: any) {
    if (message.body === "ping") {
      message.reply("pong");
    }
  }

  /**
   * Maneja los errores del cliente de WhatsApp.
   * @param error - El error que se ha producido.
   */
  private onError(error: any) {
    console.error("Error: ", error);
  }

  /**
   * Envía un mensaje a un número de teléfono específico.
   * @param phoneNumber - El número de teléfono del destinatario.
   * @param message - El contenido del mensaje a enviar.
   */
  public async sendMessage(phoneNumber: string, message: string) {
    try {
      const formattedNumber = formatPhoneNumberForWhatsApp(phoneNumber);
      await this.client.sendMessage(formattedNumber, message);
      console.log("Mensaje enviado a ", formattedNumber);
    } catch (err: any) {
      console.error("Error al enviar el mensaje: ", err);
      throw err;
    }
  }

  /**
   * Cierra la sesión de WhatsApp.
   */
  public async logout() {
    try {
      await this.client.logout();
      console.log(`Cierre de sesión exitoso para ${this.client.info.wid.user}`);
    } catch (err: any) {
      console.error(`Error al cerrar sesión ${this.client.info.wid.user}`, err);
      throw err;
    }
  }
}
