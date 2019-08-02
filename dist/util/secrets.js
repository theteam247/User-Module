"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENVIRONMENT = process.env.NODE_ENV;
exports.jwt = {
    secret: process.env.JWT_SECRET
};
exports.sequelize = {
    dialect: process.env.DB_DIALECT,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
};
exports.url = {
    resetPassword: process.env.URL_RESET_PASSWORD
};
exports.sendgrid = {
    from: process.env.SENDGRID_FROM,
    username: process.env.SENDGRID_USERNAME,
    password: process.env.SENDGRID_PASSWORD,
    template: {
        forgotPassword: process.env.SENDGRID_TEMPLATE_FORGOT_PASSWORD,
        resetPassword: process.env.SENDGRID_TEMPLATE_RESET_PASSWORD,
    }
};
//# sourceMappingURL=secrets.js.map