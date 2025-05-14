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
      console.log(message);
      console.log(
        `Enviando mensaje al número ${message.phoneNumberMaestro}: ${message.message}`
      );
      await this.whatsappClient.sendMessage(
        message.sessionId,
        message.phoneNumberMaestro,
        message.message
      );
      console.log(`Mensaje enviado a ${message.phoneNumberMaestro}`);
      return await Message.create(message);
    } catch (err) {
      console.error("Error en createMessage:", err);
      throw new Error("Error al enviar el mensaje: " + err);
    }
  }
}

export default MessageService;
