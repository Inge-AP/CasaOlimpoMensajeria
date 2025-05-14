"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/whatsappRoutes.ts
const express_1 = require("express");
const WhatsAppWebController_1 = require("../controllers/WhatsAppWebController");
const router = (0, express_1.Router)();
/**
 * Ruta para crear un nuevo cliente de WhatsApp.
 * Utiliza el método `createWAClient` del controlador de WhatsApp.
 */
router.post('/crearCliente', WhatsAppWebController_1.createWAClient);
/**
 * Ruta para obtener todos los clientes de WhatsApp.
 * Utiliza el método `getAllClients` del controlador de WhatsApp.
 */
router.get('/obtenerClientes', WhatsAppWebController_1.getAllClients);
/**
 * Ruta para eliminar todos los clientes de WhatsApp.
 * Utiliza el método `deleteAllClients` del controlador de WhatsApp.
 */
router.delete('/eliminarClientes', WhatsAppWebController_1.deleteAllClients);
/**
 * Ruta para eliminar un cliente específico de WhatsApp.
 * Utiliza el método `deleteClient` del controlador de WhatsApp.
 */
router.delete('/eliminarCliente', WhatsAppWebController_1.deleteClient);
exports.default = router;
