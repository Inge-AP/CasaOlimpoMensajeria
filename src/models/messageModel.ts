import { IMessage } from "../interfaces/IMessage";
import mongoose, { Schema, Document } from "mongoose";

/**
 * Interfaz que extiende `IMessage` y `Document` de Mongoose.
 * Representa un documento de mensaje en la base de datos.
 */
export interface IMessageDocument extends IMessage, Document {}

/**
 * Esquema de Mongoose para los mensajes.
 * Define la estructura y los tipos de los campos en la colección de mensajes.
 */
const messageSchema = new Schema(
  {
    /**
     * La fecha y hora en que se envió el mensaje.
     */
    sent_on: { type: String, required: true },

    /**
     * El ID de la sesión en la que se envió el mensaje.
     */
    sessionId: { type: String, required: true },

    /**
     * El número de teléfono del destinatario del mensaje.
     */
    phoneNumberCliente: { type: String, required: true },
    /**
     * El número de teléfono del destinatario del mensaje.
     */
    phoneNumberMaestro: { type: String, required: true },

    /**
     * El nombre de usuario del remitente del mensaje.
     */
    nombreDelCliente: { type: String, required: true },

    /**
     * El contenido del mensaje.
     */
    message: { type: String, required: true },
  },
  {
    /**
     * Nombre de la colección en la base de datos.
     */
    collection: "Messages",
  }
);

/**
 * Modelo de Mongoose para los mensajes.
 * Permite interactuar con la colección `Messages` en la base de datos.
 */
const Message = mongoose.model<IMessageDocument>("Message", messageSchema);

export default Message;
