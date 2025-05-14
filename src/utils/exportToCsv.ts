import Message from "../models/messageModel";
import fs from "fs";
const { Parser } = require("json2csv");

/**
 * Sanitiza un mensaje para eliminar o escapar caracteres especiales que puedan afectar el CSV.
 * @param message - El mensaje a sanitizar.
 * @returns El mensaje sanitizado.
 */
const sanitizeMessage = (message: string): string => {
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
const exportToCsv = async (filter = {}): Promise<void> => {
  try {
    // Obtiene los mensajes de la base de datos según el filtro proporcionado.
    const messages = await Message.find(filter).lean();

    // Verifica si se encontraron mensajes.
    if (messages.length === 0) {
      throw new Error("No hay mensajes para exportar");
    }

    // Sanitiza los mensajes antes de convertirlos a CSV.
    const sanitizedMessages = messages.map((message) => ({
      ...message,
      message: sanitizeMessage(message.message),
    }));

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
    fs.writeFileSync("messages.csv", csv, "utf-8");
    console.log("Messages exported to messages.csv");
  } catch (error) {
    console.error("Error exporting to CSV", error);
  }
};

export default exportToCsv;
