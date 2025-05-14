import express from "express";
import UtilsController from "../controllers/UtilsController";

const router = express.Router();
const utilsController = UtilsController;

/**
 * Ruta para exportar datos a un archivo CSV.
 * Utiliza el método `exportToCsv` del controlador de utilidades.
 */
router.get("/exportToCsv", utilsController.exportToCsv);

export default router;
