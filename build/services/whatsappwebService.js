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
// src/services/whatsappwebService.ts
const WhatsappWebSession_1 = require("./WhatsappWebSession");
const promises_1 = require("fs/promises");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const path_1 = __importDefault(require("path"));
class WhatsAppClient {
    constructor() {
        this.sessionIdVsClientInstance = {};
        this.onQR = (qr) => {
            qrcode_terminal_1.default.generate(qr, { small: true });
        };
        this.onReady = (sessionId) => {
            console.log(`Sesion ${sessionId} de WhatsApp-web.js está listo para usarse!`);
        };
    }
    /**
     * Obtiene la instancia única de `WhatsAppClient`.
     * @returns La instancia única de `WhatsAppClient`.
     */
    static getInstance() {
        if (!WhatsAppClient.instance) {
            WhatsAppClient.instance = new WhatsAppClient();
        }
        return WhatsAppClient.instance;
    }
    /**
     * Crea un nuevo cliente de WhatsApp.
     * @param sessionId - El ID de sesión para el nuevo cliente.
     * @param qrGenerationCallback - Función de callback para generar el código QR.
     * @param readyInstanceCallback - Función de callback cuando la sesión está lista.
     */
    createWAClient(sessionId, qrGenerationCallback, readyInstanceCallback) {
        const session = new WhatsappWebSession_1.WhatsappWebSession(sessionId, qrGenerationCallback, readyInstanceCallback);
        this.sessionIdVsClientInstance[sessionId] = session;
    }
    /**
     * Obtiene todos los clientes de WhatsApp en memoria.
     * @returns Un objeto con todos los clientes, indexados por su ID de sesión.
     */
    getAllClients() {
        return this.sessionIdVsClientInstance;
    }
    /**
     * Restaura las sesiones anteriores desde el sistema de archivos.
     */
    restorePreviousSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            const authPath = path_1.default.resolve(__dirname, "../../.wwebjs_auth");
            try {
                yield this.ensureDirectoryExists(authPath);
                const directoryNames = yield this.getDirectories(authPath);
                const sessionIds = directoryNames.map((name) => name.split("-")[1]);
                sessionIds.forEach((sessionId) => {
                    this.createWAClient(sessionId, this.onQR, this.onReady);
                });
                console.log(`${sessionIds.length} sesiones anteriores encontradas`);
            }
            catch (err) {
                console.error("Error al buscar sesiones anterires:", err);
            }
        });
    }
    ensureDirectoryExists(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.mkdir)(directory, { recursive: true });
            }
            catch (err) {
                if (err.code !== "EEXIST") {
                    throw err;
                }
            }
        });
    }
    directoryExists(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.stat)(directory);
                return true;
            }
            catch (err) {
                if (err.code === "ENOENT") {
                    return false;
                }
                throw err;
            }
        });
    }
    /**
     * Envía un mensaje a través de una sesión de WhatsApp.
     * @param sessionId - El ID de sesión de WhatsApp.
     * @param phoneNumber - El número de teléfono del destinatario.
     * @param message - El contenido del mensaje.
     */
    sendMessage(sessionId, phoneNumber, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = this.sessionIdVsClientInstance[sessionId];
                if (!session) {
                    throw new Error(`Sesión ${sessionId} no encontrada.`);
                }
                yield session.sendMessage(phoneNumber, message);
            }
            catch (err) {
                console.error("Error al enviar el mensaje:", err);
                throw err;
            }
        });
    }
    getDirectories(source) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield (0, promises_1.readdir)(source, { withFileTypes: true }))
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);
        });
    }
    /**
     * Elimina todas las sesiones de WhatsApp, tanto en memoria como en el sistema de archivos.
     */
    deleteAllSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            const authPath = path_1.default.resolve(__dirname, "../../.wwebjs_auth");
            try {
                const directoryNames = yield this.getDirectories(authPath);
                const sessionIds = directoryNames.map((name) => name.split("-")[1]);
                // Eliminar las sesiones en memoria
                sessionIds.forEach((sessionId) => {
                    const session = this.sessionIdVsClientInstance[sessionId];
                    if (session) {
                        session
                            .logout()
                            .catch((err) => console.error(`Error al cerrar sesión ${sessionId}:`, err));
                        delete this.sessionIdVsClientInstance[sessionId];
                    }
                });
                // Eliminar los datos persistidos en el sistema de archivos
                for (const directory of directoryNames) {
                    const dirPath = path_1.default.join(authPath, directory);
                    if (yield this.directoryExists(dirPath)) {
                        yield (0, promises_1.rm)(dirPath, { recursive: true, force: true });
                    }
                }
                console.log(`Todas las sesiones eliminadas exitosamente.`);
            }
            catch (err) {
                console.error("Error al eliminar sesiones:", err);
            }
        });
    }
    /**
     * Elimina una sesión específica de WhatsApp.
     * @param sessionId - El ID de sesión a eliminar.
     */
    deleteSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const authPath = path_1.default.resolve(__dirname, "../../.wwebjs_auth");
            const session = this.sessionIdVsClientInstance[sessionId];
            const sessionDir = path_1.default.join(authPath, `session-${sessionId}`);
            try {
                if (session) {
                    yield session.logout();
                    delete this.sessionIdVsClientInstance[sessionId];
                }
                if (yield this.directoryExists(sessionDir)) {
                    yield (0, promises_1.rm)(sessionDir, { recursive: true, force: true });
                }
                console.log(`Sesión ${sessionId} eliminada exitosamente.`);
            }
            catch (err) {
                console.error(`Error al eliminar la sesión ${sessionId}:`, err);
                throw err;
            }
        });
    }
}
exports.default = WhatsAppClient;
