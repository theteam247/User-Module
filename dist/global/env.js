"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
const dot_object_1 = __importDefault(require("dot-object"));
dotenv_flow_1.default.config();
const configs = Object.assign({}, process.env);
dot_object_1.default.object(configs);
lodash_1.default.merge({
    mail: {
        template: {
            forgotPassword: "You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${req.hostname}/reset/${user.passwordResetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n",
            resetPassword: "Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed."
        }
    }
}, configs);
exports.default = configs;
//# sourceMappingURL=env.js.map