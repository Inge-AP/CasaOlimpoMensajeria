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

// Inicializando el cliente de WhatsApp Web
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

// Configuración de las rutas
app.use("/api/whatsapp", whatsWebRoutes);
app.use("/api/utils", utilRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/", (req, res) => {
  res.send("API de WhatsApp Web funcionando correctamente");
});

// Inicia el servidor en el puerto especificado
app.listen(process.env.PORT, () => {
  console.log(`Servidor funcionando en el puerto ${process.env.PORT}`);
});
