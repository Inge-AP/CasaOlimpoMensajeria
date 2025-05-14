"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Conecta a la base de datos de MongoDB.
 *
 * Esta función utiliza la biblioteca `mongoose` para conectar a una base de datos MongoDB
 * utilizando la URI especificada en la variable de entorno `MONGO_URI`.
 * En caso de que la conexión sea exitosa, se imprime un mensaje en la consola.
 * Si ocurre un error durante la conexión, se imprime el error y el proceso termina con un código de estado 1.
 */
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI, {
        // Puedes agregar opciones adicionales de configuración aquí, si es necesario.
        });
        console.log("Base de datos de MongoDB conectada");
    }
    catch (err) {
        console.error("Error conectando a la base de datos MongoDB: ", err);
        process.exit(1);
    }
});
exports.default = connectDB;
