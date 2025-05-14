import { Request, Response } from "express";
import exportToCsv from "../utils/exportToCsv";
import path from "path";
import fs from "fs";

/**
 * Clase controladora para manejar las utilidades, como la exportación de datos a CSV.
 */
class UtilController {
    constructor() {}

    /**
     * Exporta datos filtrados a un archivo CSV y lo descarga.
     * @param req - El objeto de solicitud: Json con los campos a utilizar para filtrar los resultados.
     * @param res - El objeto de respuesta: Arhivo csv con los mensjaes.
     */
    async exportToCsv(req: Request, res: Response) {
        try {
            const filter = req.body;
            await exportToCsv(filter);

            // Define la ruta al archivo CSV exportado
            const filePath = path.join(__dirname, "../../messages.csv");

            // Verifica si el archivo existe y lo descarga, de lo contrario, envía un error 404
            if (fs.existsSync(filePath)) {
                res.status(200).download(filePath);
            } else {
                res.status(404).send("Archivo no encontrado");
            }
        } catch (error) {
            console.error("Error exportando a CSV", error);
            res.status(500).send("Error exportando a CSV");
        }
    }
}

export default new UtilController();
