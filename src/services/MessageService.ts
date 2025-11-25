// src/services/MessageService.ts
import { IMessageService } from "../interfaces/IMessageService";
import Message from "../models/messageModel";
import { IMessage } from "../interfaces/IMessage";
import WhatsAppClient from "./whatsappwebService";

class MessageService implements IMessageService {
  private whatsappClient: WhatsAppClient;

  /**
   * Constructor para inicializar el servicio de mensajes.
   * Configura una instancia de `WhatsAppClient` y enlaza el método `createMessage`.
   */
  constructor() {
    this.whatsappClient = WhatsAppClient.getInstance();
    this.createMessage = this.createMessage.bind(this);
  }

  /**
   * Obtiene todos los mensajes almacenados en la base de datos.
   * @returns Una promesa que resuelve con una lista de mensajes.
   */
  async getAllMessages(): Promise<IMessage[]> {
    return await Message.find();
  }

  /**
   * Obtiene mensajes filtrados por fecha.
   * @param date - La fecha para filtrar los mensajes.
   * @returns Una promesa que resuelve con una lista de mensajes.
   */
  async getMessageByDate(date: string): Promise<IMessage[]> {
    return await Message.find({ sent_on: date });
  }

  /**
   * Obtiene mensajes filtrados por número de teléfono.
   * @param phoneNumber - El número de teléfono para filtrar los mensajes.
   * @returns Una promesa que resuelve con una lista de mensajes.
   */
  async getMessageByPhoneNumber(phoneNumber: string): Promise<IMessage[]> {
    return await Message.find({ phoneNumber: phoneNumber });
  }

  /**
   * Crea un nuevo mensaje y lo envía a través de WhatsApp.
   * @param message - El mensaje a crear y enviar.
   * @returns Una promesa que resuelve con el mensaje creado.
   */
  async createMessage(message: IMessage): Promise<IMessage> {
    try {
      console.log("Datos del mensaje:", message);
      console.log(
        `Enviando mensaje al número ${message.phoneNumberMaestro}: ${message.message}`
      );

      const clients = this.whatsappClient.getAllClients();
      if (!clients[message.sessionId]) {
        throw new Error(`Sesión ${message.sessionId} no existe.`);
      }

      // Usar el nuevo método con espera
      await this.whatsappClient.sendMessageWithWait(
        message.sessionId,
        message.phoneNumberMaestro,
        message.message,
        30000 // Esperar máximo 30 segundos
      );
      
      console.log(`Mensaje enviado a ${message.phoneNumberMaestro}`);
      return await Message.create(message);
    } catch (err: any) {
      console.error("Error en createMessage:", err.message);
      throw new Error("Error al enviar el mensaje: " + err.message);
    }
  }
}

export default MessageService;
