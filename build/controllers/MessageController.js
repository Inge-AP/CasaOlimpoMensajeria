"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageModel_1 = __importDefault(require("../models/messageModel"));
const datesUtil_1 = require("../utils/datesUtil");
/**
 * Clase controladora para manejar las operaciones relacionadas con los mensajes.
 */
class MessageController {
    /**
     * Constructor para inicializar el controlador con el servicio de mensajes.
     * @param messageService - Una instancia de IMessageService que proporciona métodos para interactuar con los mensajes.
     */
    constructor(messageService) {
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
    getAllMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield this.MessageService.getAllMessages();
                res.status(200).json(messages);
            }
            catch (err) {
                res
                    .status(500)
                    .json({ error: "Problemas obteniendo mensajes", message: err });
            }
        });
    }
    /**
     * Crea un nuevo mensaje.
     * @param req - El objeto de solicitud: Un Json con el mensaje de tipo IMessage con los datos del mensaje.
     * @param res - El objeto de respuesta: El Mensaje que ha sido creado y enviado.
     */
    CreateMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = new messageModel_1.default({
                    sent_on: (0, datesUtil_1.generateDate)(),
                    sessionId: req.body.sessionId,
                    phoneNumberCliente: req.body.phoneNumberCliente,
                    phoneNumberMaestro: req.body.phoneNumberMaestro, //Obtener del front
                    nombreDelCliente: req.body.nombreDelCliente,
                    message: req.body.message,
                });
                const createdMessage = yield this.MessageService.createMessage(message);
                res.status(201).json(createdMessage);
            }
            catch (err) {
                res.status(500).json({ message: err });
            }
        });
    }
    /**
     * Obtiene mensajes por fecha.
     * @param req - El objeto de solicitud: json con la fecha.
     * @param res - El objeto de respuesta: lista de mensajes filtrados por fecha.
     */
    getMessageByDate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield this.MessageService.getMessageByDate(req.query.date);
                res.status(200).json(messages);
            }
            catch (err) {
                res
                    .status(500)
                    .json({ error: "Problemas obteniendo mensajes", message: err });
            }
        });
    }
    /**
     * Obtiene mensajes por número de teléfono.
     * @param req - El objeto de solicitud: Json con el numero de telefono.
     * @param res - El objeto de respuesta: Lista de mensajes filtrados por numero de telefono.
     */
    getMessageByPhoneNumber(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield this.MessageService.getMessageByPhoneNumber(req.body.phoneNumber);
                res.status(200).json(messages);
            }
            catch (err) {
                res
                    .status(500)
                    .json({ error: "Problemas obteniendo mensajes", message: err });
            }
        });
    }
}
exports.default = MessageController;
