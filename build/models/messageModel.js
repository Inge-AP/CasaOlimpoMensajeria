"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Esquema de Mongoose para los mensajes.
 * Define la estructura y los tipos de los campos en la colección de mensajes.
 */
const messageSchema = new mongoose_1.Schema({
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
}, {
    /**
     * Nombre de la colección en la base de datos.
     */
    collection: "Messages",
});
/**
 * Modelo de Mongoose para los mensajes.
 * Permite interactuar con la colección `Messages` en la base de datos.
 */
const Message = mongoose_1.default.model("Message", messageSchema);
exports.default = Message;
