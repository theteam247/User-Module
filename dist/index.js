"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const dot_object_1 = __importDefault(require("dot-object"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const compression_1 = __importDefault(require("compression"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const express_jwt_permissions_1 = __importDefault(require("express-jwt-permissions"));
const sequelize_1 = require("sequelize");
const user_1 = __importDefault(require("./modals/user"));
const users = __importStar(require("./controllers/users"));
const verification_1 = __importDefault(require("./controllers/verification"));
const guard = express_jwt_permissions_1.default({});
class User {
    middleware(required = "") {
        return [
            express_jwt_1.default(this.options.jwt),
            ...(required && required.length ? [guard.check(required)] : [])
        ];
    }
    constructor(options) {
        const env = Object.assign({}, process.env);
        dot_object_1.default.object(env);
        this.options = lodash_1.default.merge(env, {
            jwt: {
                getToken: (req) => {
                    if (req.headers.authorization &&
                        req.headers.authorization.split(" ")[0] === "Bearer") {
                        return req.headers.authorization.split(" ")[1];
                    }
                    else if (req.query && req.query.token) {
                        return req.query.token;
                    }
                    else if (req.cookies && req.cookies.token) {
                        return req.cookies.token;
                    }
                    return null;
                }
            }
        }, options);
        this.initSequlize();
        this.initTransporter();
        this.initTwilio();
        this.initRouter();
    }
    initSequlize() {
        const sequelize = this.options.sequelize instanceof sequelize_1.Sequelize
            ? this.options.sequelize
            : new sequelize_1.Sequelize(this.options.sequelize);
        user_1.default.define({
            sequelize: sequelize,
            attributes: this.options.model
        }).sync();
    }
    initRouter() {
        this.router = express_1.default.Router();
        // middleware that is specific to this router
        this.router.use(express_1.default.json());
        this.router.use(body_parser_1.default.json());
        this.router.use(body_parser_1.default.urlencoded({
            extended: true
        }));
        this.router.use(compression_1.default());
        this.router.use((req, res, next) => {
            req.config = this;
            next();
        });
        if (this.options.twilio) {
            this.router.post("/verification", verification_1.default);
            this.router.post("/signup/phone", this.middleware(), users.postSignupPhone);
            this.router.post("/login/2fa", this.middleware(), users.postLogin2fa);
        }
        this.router.post("/signup/email", users.postSignupEmail);
        this.router.post("/login/email", users.postLoginEmail);
        this.router.post("/login/phone", users.postLoginPhone);
        this.router.post("/password/forgot", users.postForgotPassword);
        this.router.post("/password/reset", users.postResetPassword);
        this.router.post("/account", this.middleware(), users.postAccount);
        this.router.delete("/account", this.middleware(), users.deleteAccount);
        this.router.use((error, req, res, next) => {
            if (error instanceof http_errors_1.default.HttpError) {
                return res.status(error.status).json(error);
            }
            const err = JSON.stringify(error);
            return res.status(500).json(err === "{}"
                ? {
                    message: error.message
                }
                : error);
        });
    }
    initTransporter() {
        this.transporter = nodemailer_1.default.createTransport(this.options.nodemailer);
    }
    initTwilio() {
        this.twilio = twilio_1.default(this.options.twilio.accountSid, this.options.twilio.authToken, this.options.twilio.opts);
    }
}
exports.default = User;
//# sourceMappingURL=index.js.map