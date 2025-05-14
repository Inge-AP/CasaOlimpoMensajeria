"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processWhitelist = () => {
    return process.env.CORS_WHITELIST
        ? JSON.parse(process.env.CORS_WHITELIST).map((url) => url.trim())
        : [];
};
exports.default = processWhitelist;
