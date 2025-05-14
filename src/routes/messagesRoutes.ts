import express from 'express';
import messageController from '../config/messageControllerSolution';

const router = express.Router();

/**
 * Ruta para obtener todos los mensajes.
 * Utiliza el método `getAllMessages` del controlador de mensajes.
 */
router.get('/ObtenerMensajes', messageController.getAllMessages);

/**
 * Ruta para crear un nuevo mensaje.
 * Utiliza el método `CreateMessage` del controlador de mensajes.
 */
router.post('/CrearMensaje', messageController.CreateMessage);

/**
 * Ruta para obtener mensajes por fecha.
 * Utiliza el método `getMessageByDate` del controlador de mensajes.
 */
router.get('/ObtenerMensajePorFecha', messageController.getMessageByDate);

/**
 * Ruta para obtener mensajes por número de teléfono.
 * Utiliza el método `getMessageByPhoneNumber` del controlador de mensajes.
 */
router.get('/ObtenerMensajePorNumero', messageController.getMessageByPhoneNumber);

export default router;
