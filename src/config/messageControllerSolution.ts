import MessageService from "../services/MessageService";
import MessageController from "../controllers/MessageController";

/**
 * Inicializa el servicio de mensajes.
 * 
 * Crea una instancia de `MessageService`, que implementa el servicio utilizando WhatsApp Web.js.
 */
const messageService = new MessageService(); // Implementación del servicio con WhatsApp web.js

/**
 * Inicializa el controlador de mensajes.
 * 
 * Crea una instancia de `MessageController` pasando el `messageService` como dependencia.
 * Esto permite que el controlador utilice las funcionalidades del servicio.
 */
const messageController = new MessageController(messageService);

export default messageController;
