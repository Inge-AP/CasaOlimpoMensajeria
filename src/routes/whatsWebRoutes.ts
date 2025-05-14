// src/routes/whatsappRoutes.ts
import { Router } from 'express';
import { getAllClients, deleteAllClients, deleteClient, createWAClient } from '../controllers/WhatsAppWebController';

const router = Router();

/**
 * Ruta para crear un nuevo cliente de WhatsApp.
 * Utiliza el método `createWAClient` del controlador de WhatsApp.
 */
router.post('/crearCliente', createWAClient);

/**
 * Ruta para obtener todos los clientes de WhatsApp.
 * Utiliza el método `getAllClients` del controlador de WhatsApp.
 */
router.get('/obtenerClientes', getAllClients);

/**
 * Ruta para eliminar todos los clientes de WhatsApp.
 * Utiliza el método `deleteAllClients` del controlador de WhatsApp.
 */
router.delete('/eliminarClientes', deleteAllClients);

/**
 * Ruta para eliminar un cliente específico de WhatsApp.
 * Utiliza el método `deleteClient` del controlador de WhatsApp.
 */
router.delete('/eliminarCliente', deleteClient);

export default router;
