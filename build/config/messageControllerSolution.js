"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MessageService_1 = __importDefault(require("../services/MessageService"));
const MessageController_1 = __importDefault(require("../controllers/MessageController"));
/**
 * Inicializa el servicio de mensajes.
 *
 * Crea una instancia de `MessageService`, que implementa el servicio utilizando WhatsApp Web.js.
 */
const messageService = new MessageService_1.default(); // Implementación del servicio con WhatsApp web.js
/**
 * Inicializa el controlador de mensajes.
 *
 * Crea una instancia de `MessageController` pasando el `messageService` como dependencia.
 * Esto permite que el controlador utilice las funcionalidades del servicio.
 */
const messageController = new MessageController_1.default(messageService);
exports.default = messageController;
