import { IMessage } from "./IMessage";

/**
 * Interfaz que define los métodos del servicio de mensajes.
 */
export interface IMessageService {
    /**
     * Obtiene todos los mensajes.
     * @returns Una promesa que resuelve con una lista de mensajes.
     */
    getAllMessages(): Promise<IMessage[]>;

    /**
     * Obtiene mensajes filtrados por fecha.
     * @param date - La fecha para filtrar los mensajes.
     * @returns Una promesa que resuelve con una lista de mensajes.
     */
    getMessageByDate(date: string): Promise<IMessage[]>;

    /**
     * Obtiene mensajes filtrados por número de teléfono.
     * @param phoneNumber - El número de teléfono para filtrar los mensajes.
     * @returns Una promesa que resuelve con una lista de mensajes.
     */
    getMessageByPhoneNumber(phoneNumber: string): Promise<IMessage[]>;

    /**
     * Crea un nuevo mensaje.
     * @param message - El mensaje a crear.
     * @returns Una promesa que resuelve con el mensaje creado.
     */
    createMessage(message: IMessage): Promise<IMessage>;
}
