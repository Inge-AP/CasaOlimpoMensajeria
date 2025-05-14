"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UtilsController_1 = __importDefault(require("../controllers/UtilsController"));
const router = express_1.default.Router();
const utilsController = UtilsController_1.default;
/**
 * Ruta para exportar datos a un archivo CSV.
 * Utiliza el método `exportToCsv` del controlador de utilidades.
 */
router.get("/exportToCsv", utilsController.exportToCsv);
exports.default = router;
