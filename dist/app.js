"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const lusca_1 = __importDefault(require("lusca"));
const index_1 = __importDefault(require("./index"));
dotenv_1.default.config();
const user = new index_1.default();
const app = express_1.default();
app.set("port", process.env.PORT || 3000);
app.use(lusca_1.default.xframe("SAMEORIGIN"));
app.use(lusca_1.default.xssProtection(true));
app.use("/v1", user.router);
exports.default = app;
//# sourceMappingURL=app.js.map