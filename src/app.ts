import express from "express";
const morgan = require("morgan");
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import WhatsAppClient from "./services/whatsappwebService";

// Importación de las rutas
import messagesRoutes from "./routes/messagesRoutes";
import whatsWebRoutes from "./routes/whatsWebRoutes";

// Importación de las utilidades
import utilRoutes from "./routes/utilRoutes";
import processWhitelist from "./utils/corsUtils";

//autolimpieza
import BrowserManager from "./services/BrowserManager";
import AutoCleanupManager from "./services/AutoCleanupManager";
// Configuración de variables de entorno
dotenv.config();

const app = express();

// Define una lista blanca de URLs permitidas para CORS
const whitelist: string[] = processWhitelist();

// Configuramos los dominios permitidos por CORS
const corsOptions: cors.CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (whitelist.includes(origin || "")) {
      callback(null, true);
    } else {
      callback(new Error(`No permitido por CORS en: ${origin}`));
    }
  },
};

// Conexión a la base de datos
// connectDB();

// Middleware para parsear JSON
app.use(express.json());

// Middleware para registrar las solicitudes HTTP
app.use(morgan("dev"));

// Configuración de CORS
app.use(cors({origin: '*'}));

const initializeAutoSystems = async (): Promise<void> => {
  try {
    AutoCleanupManager.getInstance();
    const browserManager = BrowserManager.getInstance();
    setTimeout(async () => {
      try {
        await browserManager.getBrowser();
      } catch (error) {
        console.log(error.message);
      }
    }, 8000);
    console.log('Sistemas automáticos configurados');
  } catch (error) {
    console.error('Error inicializando sistemas automáticos:', error.message);
    console.log('La aplicación continuará funcionando, pero sin auto-limpieza');
  }
};

const initializeWhatsApp = async (): Promise<void> => {
  try {
    const WhatsAppWebClient = WhatsAppClient.getInstance();
    WhatsAppWebClient.restorePreviousSessions()
      .then(() => {
        console.log(
          "Restaurando sesiones anteriores, espere a los mensajes de confirmación de cada sesión"
        );
      })
      .catch((err) => {
        console.error("Error restaurando sesiones anteriores", err);
      });
    
  } catch (error) {
    console.error('Error restaurando sesiones anteriores:', error.message);
    console.log('Se podrán crear nuevas sesiones normalmente');
  }
}
// Inicializando el cliente de WhatsApp Web

// Configuración de las rutas
app.use("/api/whatsapp", whatsWebRoutes);
app.use("/api/utils", utilRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/", (req, res) => {
  res.send("API de WhatsApp Web funcionando correctamente");
});
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error global de la aplicación:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

const startApplication = async (): Promise<void> => {
  try {
    await initializeAutoSystems();
    setTimeout(async () => {
      await initializeWhatsApp();
    }, 5000);
    const server = app.listen(process.env.PORT, () => {
      console.log(`🌐 Servidor funcionando en el puerto ${process.env.PORT}`);
      console.log('✅ Aplicación completamente inicializada');
    });
    const gracefulShutdown = async (signal: string) => {
      console.log(`📡 Señal ${signal} recibida, cerrando aplicación...`);
      
      server.close(() => {
        console.log('🌐 Servidor HTTP cerrado');
      });

      try {
        const browserManager = BrowserManager.getInstance();
        await browserManager.closeBrowser();
        browserManager.destroy();
        console.log('🔒 Recursos limpiados correctamente');
      } catch (error) {
        console.error('⚠️ Error en limpieza:', error.message);
      }
      
      process.exit(0);
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('Error fatal iniciando la aplicación:', error.message);
    process.exit(1);
  }
}

// Inicia el servidor en el puerto especificado
startApplication();

