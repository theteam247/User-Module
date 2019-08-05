"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.sign = (payload, options) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, options.jwt.secret, Object.assign({}, options.sign), (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        });
    });
};
//# sourceMappingURL=jwt.js.map