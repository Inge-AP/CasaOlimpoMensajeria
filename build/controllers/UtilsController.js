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
const exportToCsv_1 = __importDefault(require("../utils/exportToCsv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Clase controladora para manejar las utilidades, como la exportación de datos a CSV.
 */
class UtilController {
    constructor() { }
    /**
     * Exporta datos filtrados a un archivo CSV y lo descarga.
     * @param req - El objeto de solicitud: Json con los campos a utilizar para filtrar los resultados.
     * @param res - El objeto de respuesta: Arhivo csv con los mensjaes.
     */
    exportToCsv(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filter = req.body;
                yield (0, exportToCsv_1.default)(filter);
                // Define la ruta al archivo CSV exportado
                const filePath = path_1.default.join(__dirname, "../../messages.csv");
                // Verifica si el archivo existe y lo descarga, de lo contrario, envía un error 404
                if (fs_1.default.existsSync(filePath)) {
                    res.status(200).download(filePath);
                }
                else {
                    res.status(404).send("Archivo no encontrado");
                }
            }
            catch (error) {
                console.error("Error exportando a CSV", error);
                res.status(500).send("Error exportando a CSV");
            }
        });
    }
}
exports.default = new UtilController();
