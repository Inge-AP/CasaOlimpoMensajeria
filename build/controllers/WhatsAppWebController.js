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
exports.deleteClient = exports.deleteAllClients = exports.createWAClient = exports.getAllClients = void 0;
const whatsappwebService_1 = __importDefault(require("../services/whatsappwebService"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
/**
 * Obtiene todos los clientes de WhatsApp.
 * @param req - El objeto de solicitud: No es necesario, solo se usa la ruta.
 * @param res - El objeto de respuesta: Una lista con los nombres de las sesiones creadas.
 */
const getAllClients = (req, res) => {
    const WhatsAppWebClient = whatsappwebService_1.default.getInstance();
    const clients = Object.keys(WhatsAppWebClient.getAllClients());
    res.json({ clients });
};
exports.getAllClients = getAllClients;
/**
 * Crea un nuevo cliente de WhatsApp.
 * @param req - El objeto de solicitud: Json con el nombre de la sesion.
 * @param res - El objeto de respuesta: Codigo qr para el inicio de session de WhatsApp Web.
 */
const createWAClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.body;
    if (!sessionId) {
        res.status(400).send({ status: 'Se requiere un ID de sesión' });
        return;
    }
    const WhatsAppWebClient = whatsappwebService_1.default.getInstance();
    WhatsAppWebClient.createWAClient(sessionId, qr => {
        qrcode_terminal_1.default.generate(qr, { small: true });
        res.send({ qr });
    }, () => {
        console.log(`Sesión ${sessionId} lista`);
    });
});
exports.createWAClient = createWAClient;
/**
 * Elimina todos los clientes de WhatsApp.
 * @param req - El objeto de solicitud: no es necesario, solo debe utilizarse la ruta.
 * @param res - El objeto de respuesta: Mensaje de confirmacion.
 */
const deleteAllClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const WhatsAppWebClient = whatsappwebService_1.default.getInstance();
    try {
        yield WhatsAppWebClient.deleteAllSessions();
        res.status(200).send('Todos los clientes eliminados exitosamente.');
    }
    catch (err) {
        res.status(500).send('Error al eliminar los clientes.');
    }
});
exports.deleteAllClients = deleteAllClients;
/**
 * Elimina un cliente de WhatsApp específico.
 * @param req - El objeto de solicitud: Json con el nombre de la sesion a eliminar.
 * @param res - El objeto de respuesta: Mensaje de confirmacion.
 */
const deleteClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.body;
    if (!sessionId) {
        res.status(400).send({ status: 'Se requiere un ID de sesión' });
        return;
    }
    const WhatsAppWebClient = whatsappwebService_1.default.getInstance();
    try {
        yield WhatsAppWebClient.deleteSession(sessionId);
        res.status(200).send(`Cliente ${sessionId} eliminado exitosamente.`);
    }
    catch (err) {
        res.status(500).send(`Error al eliminar el cliente ${sessionId}.`);
    }
});
exports.deleteClient = deleteClient;
