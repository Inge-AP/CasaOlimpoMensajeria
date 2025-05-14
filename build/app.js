"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan = require("morgan");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const whatsappwebService_1 = __importDefault(require("./services/whatsappwebService"));
// Importación de las rutas
const messagesRoutes_1 = __importDefault(require("./routes/messagesRoutes"));
const whatsWebRoutes_1 = __importDefault(require("./routes/whatsWebRoutes"));
// Importación de las utilidades
const utilRoutes_1 = __importDefault(require("./routes/utilRoutes"));
const corsUtils_1 = __importDefault(require("./utils/corsUtils"));
// Configuración de variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
// Define una lista blanca de URLs permitidas para CORS
const whitelist = (0, corsUtils_1.default)();
// Configuramos los dominios permitidos por CORS
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin || "")) {
            callback(null, true);
        }
        else {
            callback(new Error(`No permitido por CORS en: ${origin}`));
        }
    },
};
// Conexión a la base de datos
(0, db_1.default)();
// Middleware para parsear JSON
app.use(express_1.default.json());
// Middleware para registrar las solicitudes HTTP
app.use(morgan("dev"));
// Configuración de CORS
app.use((0, cors_1.default)(corsOptions));
// Inicializando el cliente de WhatsApp Web
const WhatsAppWebClient = whatsappwebService_1.default.getInstance();
WhatsAppWebClient.restorePreviousSessions()
    .then(() => {
    console.log("Restaurando sesiones anteriores, espere a los mensajes de confirmación de cada sesión");
})
    .catch((err) => {
    console.error("Error restaurando sesiones anteriores", err);
});
// Configuración de las rutas
app.use("/api/whatsapp", whatsWebRoutes_1.default);
app.use("/api/utils", utilRoutes_1.default);
app.use("/api/messages", messagesRoutes_1.default);
app.use("/", (req, res) => {
    res.send("API de WhatsApp Web funcionando correctamente");
});
// Inicia el servidor en el puerto especificado
app.listen(process.env.PORT, () => {
    console.log(`Servidor funcionando en el puerto ${process.env.PORT}`);
});
