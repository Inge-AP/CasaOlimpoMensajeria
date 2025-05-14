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
const whatsappwebService_1 = __importDefault(require("./whatsappwebService"));
class MessageService {
    /**
     * Constructor para inicializar el servicio de mensajes.
     * Configura una instancia de `WhatsAppClient` y enlaza el método `createMessage`.
     */
    constructor() {
        this.whatsappClient = whatsappwebService_1.default.getInstance();
        this.createMessage = this.createMessage.bind(this);
    }
    /**
     * Obtiene todos los mensajes almacenados en la base de datos.
     * @returns Una promesa que resuelve con una lista de mensajes.
     */
    getAllMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield messageModel_1.default.find();
        });
    }
    /**
     * Obtiene mensajes filtrados por fecha.
     * @param date - La fecha para filtrar los mensajes.
     * @returns Una promesa que resuelve con una lista de mensajes.
     */
    getMessageByDate(date) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield messageModel_1.default.find({ sent_on: date });
        });
    }
    /**
     * Obtiene mensajes filtrados por número de teléfono.
     * @param phoneNumber - El número de teléfono para filtrar los mensajes.
     * @returns Una promesa que resuelve con una lista de mensajes.
     */
    getMessageByPhoneNumber(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield messageModel_1.default.find({ phoneNumber: phoneNumber });
        });
    }
    /**
     * Crea un nuevo mensaje y lo envía a través de WhatsApp.
     * @param message - El mensaje a crear y enviar.
     * @returns Una promesa que resuelve con el mensaje creado.
     */
    createMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(message);
                console.log(`Enviando mensaje al número ${message.phoneNumberMaestro}: ${message.message}`);
                yield this.whatsappClient.sendMessage(message.sessionId, message.phoneNumberMaestro, message.message);
                console.log(`Mensaje enviado a ${message.phoneNumberMaestro}`);
                return yield messageModel_1.default.create(message);
            }
            catch (err) {
                console.error("Error en createMessage:", err);
                throw new Error("Error al enviar el mensaje: " + err);
            }
        });
    }
}
exports.default = MessageService;
