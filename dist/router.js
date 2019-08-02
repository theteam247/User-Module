"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
class Account {
    constructor(opts) {
        this.postLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    errors: errors.array()
                });
            }
            // get user
        });
        this.jwt = express_jwt_1.default(opts.jwt);
        this.router = express_1.default.Router();
        // middleware that is specific to this router
        this.router.use(compression_1.default());
        this.router.use(body_parser_1.default.json());
        this.router.use(body_parser_1.default.urlencoded({ extended: true }));
        // this.router.get("/login", userController.getLogin);
        this.router.get("/login", [
            express_validator_1.check("email", "Email is not valid").isEmail(),
            express_validator_1.check("password", "Password cannot be blank").isLength({ min: 1 }),
            express_validator_1.sanitize("email").normalizeEmail({ gmail_remove_dots: false })
        ], this.postLogin);
    }
}
exports.default = Account;
//# sourceMappingURL=router.js.map