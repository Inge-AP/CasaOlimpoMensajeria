import { Request, Response } from "express";
import { IMessageService } from "../interfaces/IMessageService";
import Message from "../models/messageModel";
import { generateDate } from "../utils/datesUtil";

/**
 * Clase controladora para manejar las operaciones relacionadas con los mensajes.
 */
class MessageController {
  private MessageService: IMessageService;

  /**
   * Constructor para inicializar el controlador con el servicio de mensajes.
   * @param messageService - Una instancia de IMessageService que proporciona métodos para interactuar con los mensajes.
   */
  constructor(messageService: IMessageService) {
    this.MessageService = messageService;

    // Enlaza los métodos para mantener el contexto de "this".
    this.getAllMessages = this.getAllMessages.bind(this);
    this.CreateMessage = this.CreateMessage.bind(this);
    this.getMessageByDate = this.getMessageByDate.bind(this);
    this.getMessageByPhoneNumber = this.getMessageByPhoneNumber.bind(this);
  }

  /**
   * Obtiene todos los mensajes.
   * @param req - El objeto de solicitud: no es necesario, solo llamar la ruta.
   * @param res - El objeto de respuesta: una lista con todos los menjaes.
   */
  async getAllMessages(req: Request, res: Response) {
    try {
      const messages = await this.MessageService.getAllMessages();
      res.status(200).json(messages);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Problemas obteniendo mensajes", message: err });
    }
  }

  /**
   * Crea un nuevo mensaje.
   * @param req - El objeto de solicitud: Un Json con el mensaje de tipo IMessage con los datos del mensaje.
   * @param res - El objeto de respuesta: El Mensaje que ha sido creado y enviado.
   */
  async CreateMessage(req: Request, res: Response) {
    try {
      const message = new Message({
        sent_on: generateDate(),
        sessionId: req.body.sessionId,
        phoneNumberCliente: req.body.phoneNumberCliente,
        phoneNumberMaestro: req.body.phoneNumberMaestro, //Obtener del front
        nombreDelCliente: req.body.nombreDelCliente,
        message: req.body.message,
      });
      const createdMessage = await this.MessageService.createMessage(message);
      res.status(201).json(createdMessage);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }

  /**
   * Obtiene mensajes por fecha.
   * @param req - El objeto de solicitud: json con la fecha.
   * @param res - El objeto de respuesta: lista de mensajes filtrados por fecha.
   */
  async getMessageByDate(req: Request, res: Response) {
    try {
      const messages = await this.MessageService.getMessageByDate(
        req.query.date as string
      );
      res.status(200).json(messages);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Problemas obteniendo mensajes", message: err });
    }
  }

  /**
   * Obtiene mensajes por número de teléfono.
   * @param req - El objeto de solicitud: Json con el numero de telefono.
   * @param res - El objeto de respuesta: Lista de mensajes filtrados por numero de telefono.
   */
  async getMessageByPhoneNumber(req: Request, res: Response) {
    try {
      const messages = await this.MessageService.getMessageByPhoneNumber(
        req.body.phoneNumber
      );
      res.status(200).json(messages);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Problemas obteniendo mensajes", message: err });
    }
  }
}

export default MessageController;
