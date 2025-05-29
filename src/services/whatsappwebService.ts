// src/services/whatsappwebService.ts
import { WhatsappWebSession } from "./WhatsappWebSession";
import { readdir, mkdir, rm, stat } from "fs/promises";
import qrcode from "qrcode-terminal";
import path from "path";

class WhatsAppClient {
  private static instance: WhatsAppClient;
  private sessionIdVsClientInstance: { [key: string]: WhatsappWebSession } = {};

  private constructor() {}

  /**
   * Obtiene la instancia única de `WhatsAppClient`.
   * @returns La instancia única de `WhatsAppClient`.
   */
  public static getInstance(): WhatsAppClient {
    if (!WhatsAppClient.instance) {
      WhatsAppClient.instance = new WhatsAppClient();
    }
    return WhatsAppClient.instance;
  }

  /**
   * Crea un nuevo cliente de WhatsApp.
   * @param sessionId - El ID de sesión para el nuevo cliente.
   * @param qrGenerationCallback - Función de callback para generar el código QR.
   * @param readyInstanceCallback - Función de callback cuando la sesión está lista.
   */
  public createWAClient(
    sessionId: string,
    qrGenerationCallback: (qr: string) => void,
    readyInstanceCallback: (sessionId: string) => void
  ): void {
    const session = new WhatsappWebSession(
      sessionId,
      qrGenerationCallback,
      readyInstanceCallback
    );
    this.sessionIdVsClientInstance[sessionId] = session;
  }

  /**
   * Obtiene todos los clientes de WhatsApp en memoria.
   * @returns Un objeto con todos los clientes, indexados por su ID de sesión.
   */
  public getAllClients(): { [key: string]: WhatsappWebSession } {
    return this.sessionIdVsClientInstance;
  }

  /**
   * Restaura las sesiones anteriores desde el sistema de archivos.
   */
  public async restorePreviousSessions(): Promise<void> {
    const authPath = path.resolve(__dirname, "../../.wwebjs_auth");
    try {
      await this.ensureDirectoryExists(authPath);
      const directoryNames = await this.getDirectories(authPath);
      const sessionIds = directoryNames.map((name) => name.split("-")[1]);

      sessionIds.forEach((sessionId) => {
        this.createWAClient(sessionId, this.onQR, this.onReady);
      });

      console.log(`${sessionIds.length} sesiones anteriores encontradas`);
    } catch (err) {
      console.error("Error al buscar sesiones anterires:", err);
    }
  }

  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await mkdir(directory, { recursive: true });
    } catch (err: any) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }
  }

  private async directoryExists(directory: string): Promise<boolean> {
    try {
      await stat(directory);
      return true;
    } catch (err: any) {
      if (err.code === "ENOENT") {
        return false;
      }
      throw err;
    }
  }

  /**
   * Envía un mensaje a través de una sesión de WhatsApp.
   * @param sessionId - El ID de sesión de WhatsApp.
   * @param phoneNumber - El número de teléfono del destinatario.
   * @param message - El contenido del mensaje.
   */
  public async sendMessage(
    sessionId: string,
    phoneNumber: string,
    message: string
  ): Promise<void> {
    try {
      const session = this.sessionIdVsClientInstance[sessionId];
      if (!session) {
        throw new Error(`Sesión ${sessionId} no encontrada.`);
      }

      await session.sendMessage(phoneNumber, message);
    } catch (err) {
      console.error("Error al enviar el mensaje:", err);
      throw err;
    }
  }

  private async getDirectories(source: string): Promise<string[]> {
    return (await readdir(source, { withFileTypes: true }))
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  }

  private onQR = (qr: string) => {
    qrcode.generate(qr, { small: true });
  };

  private onReady = (sessionId: string) => {
    console.log(
      `Sesion ${sessionId} de WhatsApp-web.js está listo para usarse!`
    );
  };

  /**
   * Elimina todas las sesiones de WhatsApp, tanto en memoria como en el sistema de archivos.
   */
  public async deleteAllSessions(): Promise<void> {
    const authPath = path.resolve(__dirname, "../../.wwebjs_auth");
    try {
      const directoryNames = await this.getDirectories(authPath);
      const sessionIds = directoryNames.map((name) => name.split("-")[1]);

      // Eliminar las sesiones en memoria
      // sessionIds.forEach((sessionId) => {
      //   const session = this.sessionIdVsClientInstance[sessionId];
      //   if (session) {
      //     session
      //       .logout()
      //       .catch((err) =>
      //         console.error(`Error al cerrar sesión ${sessionId}:`, err)
      //       );
      //     delete this.sessionIdVsClientInstance[sessionId];
      //   }
      // });
      for (const sessionId of sessionIds) {
        const session = this.sessionIdVsClientInstance[sessionId];
        if (session) {
          try {
            await session.logout();
          } catch (err) {
            console.error(`Error al cerrar sesión ${sessionId}:`, err);
          }
          delete this.sessionIdVsClientInstance[sessionId];
        }
      }

      // Eliminar los datos persistidos en el sistema de archivos
      for (const directory of directoryNames) {
        const dirPath = path.join(authPath, directory);
        if (await this.directoryExists(dirPath)) {
          try {
            await rm(dirPath, { recursive: true, force: true });
          } catch(err) {
            console.error(`Error al eliminar la carpeta ${dirPath}:`, err);
          }
        }
      }
      console.log(`Todas las sesiones eliminadas exitosamente.`);
    } catch (err) {
      console.error("Error al eliminar sesiones:", err);
    }
  }

  /**
   * Elimina una sesión específica de WhatsApp.
   * @param sessionId - El ID de sesión a eliminar.
   */
  public async deleteSession(sessionId: string): Promise<void> {
    const authPath = path.resolve(__dirname, "../../.wwebjs_auth");
    const session = this.sessionIdVsClientInstance[sessionId];
    const sessionDir = path.join(authPath, `session-${sessionId}`);
    try {
      if (session) {
        await session.logout();
        delete this.sessionIdVsClientInstance[sessionId];
      }
      if (await this.directoryExists(sessionDir)) {
        await rm(sessionDir, { recursive: true, force: true });
      }
      console.log(`Sesión ${sessionId} eliminada exitosamente.`);
    } catch (err) {
      console.error(`Error al eliminar la sesión ${sessionId}:`, err);
      throw err;
    }
  }
}

export default WhatsAppClient;
