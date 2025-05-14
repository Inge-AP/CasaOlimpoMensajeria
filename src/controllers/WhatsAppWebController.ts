// src/controllers/whatsappController.ts
import { Request, Response } from 'express';
import WhatsAppClient from '../services/whatsappwebService';
import qrcode from 'qrcode-terminal';

/**
 * Obtiene todos los clientes de WhatsApp.
 * @param req - El objeto de solicitud: No es necesario, solo se usa la ruta.
 * @param res - El objeto de respuesta: Una lista con los nombres de las sesiones creadas.
 */
export const getAllClients = (req: Request, res: Response): void => {
    const WhatsAppWebClient = WhatsAppClient.getInstance();
    const clients = Object.keys(WhatsAppWebClient.getAllClients());
    res.json({ clients });
};

/**
 * Crea un nuevo cliente de WhatsApp.
 * @param req - El objeto de solicitud: Json con el nombre de la sesion.
 * @param res - El objeto de respuesta: Codigo qr para el inicio de session de WhatsApp Web.
 */
export const createWAClient = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;
    if (!sessionId) {
        res.status(400).send({ status: 'Se requiere un ID de sesión' });
        return;
    }

    const WhatsAppWebClient = WhatsAppClient.getInstance();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    WhatsAppWebClient.createWAClient(sessionId, qr => {
        qrcode.generate(qr, { small: true });
        console.log(qr)
        res.write(`Código QR generado: ${qr}\n`);
    }, () => {
        console.log(`Sesión ${sessionId} lista`);
        res.write(`Sesión ${sessionId} lista\n`);
        res.end();
    });
}

/**
 * Elimina todos los clientes de WhatsApp.
 * @param req - El objeto de solicitud: no es necesario, solo debe utilizarse la ruta.
 * @param res - El objeto de respuesta: Mensaje de confirmacion.
 */
export const deleteAllClients = async (req: Request, res: Response): Promise<void> => {
    const WhatsAppWebClient = WhatsAppClient.getInstance();
    try {
        await WhatsAppWebClient.deleteAllSessions();
        res.status(200).send('Todos los clientes eliminados exitosamente.');
    } catch (err) {
        res.status(500).send('Error al eliminar los clientes.');
    }
};

/**
 * Elimina un cliente de WhatsApp específico.
 * @param req - El objeto de solicitud: Json con el nombre de la sesion a eliminar.
 * @param res - El objeto de respuesta: Mensaje de confirmacion.
 */
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;
    if (!sessionId) {
        res.status(400).send({ status: 'Se requiere un ID de sesión' });
        return;
    }

    const WhatsAppWebClient = WhatsAppClient.getInstance();
    try {
        await WhatsAppWebClient.deleteSession(sessionId);
        res.status(200).send(`Cliente ${sessionId} eliminado exitosamente.`);
    } catch (err) {
        res.status(500).send(`Error al eliminar el cliente ${sessionId}.`);
    }
};
