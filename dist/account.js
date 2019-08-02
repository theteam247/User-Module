"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_validator_1 = require("express-validator");
const express_jwt_1 = __importDefault(require("express-jwt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
class Account {
    constructor(options) {
        this.postLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    errors: errors.array()
                });
            }
            const _a = this.options.jwt, { secret } = _a, jwtOptions = __rest(_a, ["secret"]);
            // get user from database
            const user = {
                test: 1
            };
            jsonwebtoken_1.default.sign(user, secret, jwtOptions, (error, jwt) => {
                if (error) {
                    return res.status(400).json({
                        errors: errors.array()
                    });
                }
                res.json({
                    jwt,
                });
            });
        });
        this.options = options;
        this.middleware = express_jwt_1.default(options.jwt);
        this.router = express_1.default.Router();
        this.sequelize = options.sequelize instanceof sequelize_1.Sequelize ? options.sequelize : (new sequelize_1.Sequelize(options.sequelize));
        this.initRouters();
    }
    initRouters() {
        // middleware that is specific to this router
        this.router.use(compression_1.default());
        this.router.use(body_parser_1.default.json());
        this.router.use(body_parser_1.default.urlencoded({ extended: true }));
        this.router.get("/login", [
            express_validator_1.check("email", "Email is not valid").isEmail(),
            express_validator_1.check("password", "Password cannot be blank").isLength({ min: 1 }),
            express_validator_1.sanitize("email").normalizeEmail({ gmail_remove_dots: false })
        ], this.postLogin);
    }
}
exports.default = Account;
//# sourceMappingURL=Account.js.map