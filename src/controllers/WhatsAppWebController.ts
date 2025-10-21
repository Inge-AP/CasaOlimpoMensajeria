// src/controllers/whatsappController.ts
import { Request, Response } from 'express';
import WhatsAppClient from '../services/whatsappwebService';
import qrcode from 'qrcode-terminal';
import BrowserManager from '../services/BrowserManager';
import { Session } from 'inspector';

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
    
    let attempts = 0;
    const maxAttempts = 3;

    const attemptCreation = async (): Promise<void> => {
        attempts++;
        try {
            const WhatsAppWebClient = WhatsAppClient.getInstance();
            const browserManager = BrowserManager.getInstance();

            browserManager.registerSession(sessionId);

            const isHealthy = await browserManager.healthCheck();
            if(!isHealthy) {
                await browserManager.restartBrowser();
            }
            res.setHeader('Content-Type', 'text/plain;  charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Transfer-Encoding', 'chunked');
            
            await WhatsAppWebClient.createWAClient(sessionId, qr => {
                qrcode.generate(qr, { small: true });
                console.log(qr)
                res.write(`Código QR generado: ${qr}\n`);
            }, () => {
                console.log(`Sesión ${sessionId} lista`);
                res.write(`Sesión ${sessionId} lista\n`);
                res.end();
            });
        } catch (error) {
            const browserManager = BrowserManager.getInstance();
            browserManager.unregisterSession(sessionId);
            if (attempts < maxAttempts) {
                setTimeout(() => attemptCreation(), 5000);
            } else {
                if (!res.headersSent) {
                    res.status(500).json({ 
                        error: 'Error crítico en creación de cliente',
                        attempt: attempts,
                        details: error.message 
                    });
                }
            }
        }
    };

    await attemptCreation();

};

/**
 * Elimina todos los clientes de WhatsApp.
 * @param req - El objeto de solicitud: no es necesario, solo debe utilizarse la ruta.
 * @param res - El objeto de respuesta: Mensaje de confirmacion.
 */
export const deleteAllClients = async (req: Request, res: Response): Promise<void> => {
    try {
        const WhatsAppWebClient = WhatsAppClient.getInstance();
        const browserManager = BrowserManager.getInstance();
        const currentClients = Object.keys(WhatsAppWebClient.getAllClients());
        currentClients.forEach(sessionId => {
            browserManager.unregisterSession(sessionId);
        });
        await WhatsAppWebClient.deleteAllSessions();
        setTimeout(async () => {
            await browserManager.restartBrowser();
        }, 3000);
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

    try {
        const WhatsAppWebClient = WhatsAppClient.getInstance();
        await WhatsAppWebClient.deleteSession(sessionId);

        const remainingClients = Object.keys(WhatsAppWebClient.getAllClients());
        if (remainingClients.length === 0){
            const browserManager = BrowserManager.getInstance();
            setTimeout(async () => {
                await browserManager.restartBrowser();
            }, 2000)
        }
        res.status(200).send(`Cliente ${sessionId} eliminado exitosamente.`);
    } catch (err) {
        res.status(500).send(`Error al eliminar el cliente ${sessionId}.`);
    }
};
