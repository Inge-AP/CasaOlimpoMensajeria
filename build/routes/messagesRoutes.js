"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageControllerSolution_1 = __importDefault(require("../config/messageControllerSolution"));
const router = express_1.default.Router();
/**
 * Ruta para obtener todos los mensajes.
 * Utiliza el método `getAllMessages` del controlador de mensajes.
 */
router.get('/ObtenerMensajes', messageControllerSolution_1.default.getAllMessages);
/**
 * Ruta para crear un nuevo mensaje.
 * Utiliza el método `CreateMessage` del controlador de mensajes.
 */
router.post('/CrearMensaje', messageControllerSolution_1.default.CreateMessage);
/**
 * Ruta para obtener mensajes por fecha.
 * Utiliza el método `getMessageByDate` del controlador de mensajes.
 */
router.get('/ObtenerMensajePorFecha', messageControllerSolution_1.default.getMessageByDate);
/**
 * Ruta para obtener mensajes por número de teléfono.
 * Utiliza el método `getMessageByPhoneNumber` del controlador de mensajes.
 */
router.get('/ObtenerMensajePorNumero', messageControllerSolution_1.default.getMessageByPhoneNumber);
exports.default = router;
