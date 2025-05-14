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
exports.WhatsappWebSession = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const phoneNumberUtil_1 = require("../utils/phoneNumberUtil");
const path_1 = __importDefault(require("path"));
class WhatsappWebSession {
    /**
     * Constructor para inicializar una sesión de WhatsApp Web.
     * @param sessionId - El ID de sesión para identificar la sesión.
     * @param qrGenerationCallback - Función de callback para manejar la generación del código QR.
     * @param readyInstaceCallback - Función de callback cuando la sesión está lista.
     */
    constructor(sessionId, qrGenerationCallback, readyInstaceCallback) {
        this.client = new whatsapp_web_js_1.Client({
            webVersionCache: {
                type: "remote",
                remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
            },
            // Estrategia de autenticación local con un ID de cliente y una ruta de datos.
            authStrategy: new whatsapp_web_js_1.LocalAuth({
                clientId: sessionId,
                dataPath: path_1.default.join(__dirname, "../../.wwebjs_auth"),
            }),
        });
        // Configuración de eventos para manejar el QR, la preparación y los errores.
        this.client.on("qr", qrGenerationCallback);
        this.client.on("ready", () => readyInstaceCallback(sessionId));
        this.client.on("message_create", this.onMessageCreate);
        this.client.on("error", this.onError);
        // Inicializa el cliente de WhatsApp.
        this.client.initialize();
    }
    /**
     * Maneja la creación de mensajes.
     * @param message - El mensaje que se ha creado.
     */
    onMessageCreate(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.body === "ping") {
                message.reply("pong");
            }
        });
    }
    /**
     * Maneja los errores del cliente de WhatsApp.
     * @param error - El error que se ha producido.
     */
    onError(error) {
        console.error("Error: ", error);
    }
    /**
     * Envía un mensaje a un número de teléfono específico.
     * @param phoneNumber - El número de teléfono del destinatario.
     * @param message - El contenido del mensaje a enviar.
     */
    sendMessage(phoneNumber, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formattedNumber = (0, phoneNumberUtil_1.formatPhoneNumberForWhatsApp)(phoneNumber);
                yield this.client.sendMessage(formattedNumber, message);
                console.log("Mensaje enviado a ", formattedNumber);
            }
            catch (err) {
                console.error("Error al enviar el mensaje: ", err);
                throw err;
            }
        });
    }
    /**
     * Cierra la sesión de WhatsApp.
     */
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.logout();
                console.log(`Cierre de sesión exitoso para ${this.client.info.wid.user}`);
            }
            catch (err) {
                console.error(`Error al cerrar sesión ${this.client.info.wid.user}`, err);
                throw err;
            }
        });
    }
}
exports.WhatsappWebSession = WhatsappWebSession;
