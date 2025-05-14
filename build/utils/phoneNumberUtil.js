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
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumberForWhatsApp = void 0;
const libphonenumber_js_1 = require("libphonenumber-js");
const nodemailer = require('nodemailer');
require("dotenv").config();
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.Email_user,
        pass: process.env.Email_password
    }
});
// Función para enviar correos electrónicos
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ recipients, subject, message }) {
    try {
        yield transport.sendMail({
            to: recipients,
            subject,
            text: message,
            html: message
        });
        console.log('Correo enviado correctamente.');
    }
    catch (error) {
        console.error('Error al enviar el correo:', error);
    }
});
// Contador global de errores
let errorCount = 0;
// Función para manejar errores y enviar un correo si se superan los 5
const handleError = (errorMessage) => __awaiter(void 0, void 0, void 0, function* () {
    errorCount++;
    console.error(`Error ${errorCount}: ${errorMessage}`);
    const currentDateTime = new Date().toLocaleString();
    const detailedErrorMessage = `Error ${errorCount}: ${errorMessage} \nFecha y hora: ${currentDateTime}`;
    console.error(detailedErrorMessage);
    // Si se detectan más de 5 errores, envía un correo
    if (errorCount > 2) {
        yield sendEmail({
            recipients: [process.env.email1, process.env.email2], // Cambia esto por el correo del destinatario
            subject: 'Alerta: Se han detectado más de 3 errores',
            message: `Se han detectado más de 3 errores en el sistema.\n\nÚltimo error:\n${detailedErrorMessage}`
        });
        // Reinicia el contador de errores
        errorCount = 0;
    }
});
/**
 * Toma un número local o internacional y lo formatea para ser usado por WhatsApp-web.js.
 * @param number - Número de teléfono a formatear.
 * @param defaultCountry - Código del país al que pertenece el número si es local. Por defecto es 'CO'. Si el número es internacional, se puede omitir (undefined).
 * @returns El número de teléfono formateado para WhatsApp, en formato 'phonenumber@c.us'.
 * @throws Error - Si el número de teléfono no es válido.
 */
function formatPhoneNumberForWhatsApp(number, defaultCountry = 'CO') {
    try {
        // Intenta parsear el número de teléfono utilizando la biblioteca libphonenumber-js.
        let phoneNumber = (0, libphonenumber_js_1.parsePhoneNumberFromString)(number, defaultCountry);
        // Si no se pudo parsear y el número no empieza con '+', intenta formatear el número.
        if (!phoneNumber && number[0] !== '+') {
            const asYouType = new libphonenumber_js_1.AsYouType(defaultCountry);
            number = asYouType.input(number);
            phoneNumber = (0, libphonenumber_js_1.parsePhoneNumberFromString)(number, defaultCountry);
        }
        // Verifica si el número es válido.
        if (!phoneNumber || !phoneNumber.isValid()) {
            throw new Error('El número de teléfono no es válido: ' + number);
        }
        // Verifica si el número tiene el prefijo +52 (México) y, si es así, agrega un '1' después del '52'.
        let formattedPhoneNumber = phoneNumber.number.replace('+', '');
        if (formattedPhoneNumber.startsWith('52') && !formattedPhoneNumber.startsWith('521')) {
            formattedPhoneNumber = formattedPhoneNumber.replace('52', '521');
        }
        // Retorna el número formateado para WhatsApp.
        return formattedPhoneNumber + '@c.us';
    }
    catch (error) {
        // Maneja el error y lo pasa a la función handleError
        handleError(error.message);
        throw error;
    }
}
exports.formatPhoneNumberForWhatsApp = formatPhoneNumberForWhatsApp;
module.exports = { sendEmail, handleError, formatPhoneNumberForWhatsApp };
