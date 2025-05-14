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
const fs_1 = __importDefault(require("fs"));
const { Parser } = require("json2csv");
/**
 * Sanitiza un mensaje para eliminar o escapar caracteres especiales que puedan afectar el CSV.
 * @param message - El mensaje a sanitizar.
 * @returns El mensaje sanitizado.
 */
const sanitizeMessage = (message) => {
    return message
        .replace(/"/g, '""') // Escapa las comillas dobles
        .replace(/\n/g, "\\n") // Reemplaza los saltos de línea con una barra invertida y una 'n'
        .replace(/\r/g, "\\r"); // Reemplaza los retornos de carro con una barra invertida y una 'r'
};
/**
 * Exporta los mensajes a un archivo CSV.
 * @param filter - Filtros opcionales para buscar mensajes específicos en la base de datos.
 * @throws Error si no hay mensajes para exportar.
 */
const exportToCsv = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filter = {}) {
    try {
        // Obtiene los mensajes de la base de datos según el filtro proporcionado.
        const messages = yield messageModel_1.default.find(filter).lean();
        // Verifica si se encontraron mensajes.
        if (messages.length === 0) {
            throw new Error("No hay mensajes para exportar");
        }
        // Sanitiza los mensajes antes de convertirlos a CSV.
        const sanitizedMessages = messages.map((message) => (Object.assign(Object.assign({}, message), { message: sanitizeMessage(message.message) })));
        // Configura el parser para convertir los mensajes a formato CSV.
        const parser = new Parser({
            fields: [
                "sent_on",
                "sessionId",
                "phoneNumberMaestro",
                "phoneNumberCliente",
                "nombreDelCliente",
                "message",
            ],
        });
        // Convierte los mensajes a CSV.
        const csv = parser.parse(sanitizedMessages);
        // Guarda el CSV en un archivo.
        fs_1.default.writeFileSync("messages.csv", csv, "utf-8");
        console.log("Messages exported to messages.csv");
    }
    catch (error) {
        console.error("Error exporting to CSV", error);
    }
});
exports.default = exportToCsv;
