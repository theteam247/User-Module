"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
const dot_object_1 = __importDefault(require("dot-object"));
dotenv_flow_1.default.config();
const configs = Object.assign({}, process.env);
dot_object_1.default.object(configs);
exports.default = configs;
//# sourceMappingURL=env.js.map