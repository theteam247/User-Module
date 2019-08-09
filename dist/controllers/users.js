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
const crypto_1 = __importDefault(require("crypto"));
const http_errors_1 = __importDefault(require("http-errors"));
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
const template_1 = __importDefault(require("../util/template"));
const jwt_1 = require("../util/jwt");
const user_1 = __importDefault(require("../models/user"));
exports.postSignupEmail = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.create({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        });
        const token = yield jwt_1.sign(user.toJSON(), req.module.options);
        // send Email
        const temp = template_1.default({
            req,
            user: user.get()
        });
        // don't await it
        req.module.transporter.sendMail({
            to: user.email,
            from: temp(req.module.options.mail.from),
            subject: temp(req.module.options.mail.signupSubject),
            text: temp(req.module.options.mail.signup)
        });
        res.cookie("token", token).json({
            token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postSignupPhone = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield express_validator_1.check("code", "Code is not valid")
            .exists()
            .run(req);
        express_validator_1.validationResult(req).throw();
        yield req.module.twilio.verify
            .services(req.module.options.twilio.verifySid)
            .verificationChecks.create({
            to: req.user.phoneNumber,
            code: req.body.code
        });
        const user = yield user_1.default.create(Object.assign({}, req.body, { phoneNumber: req.user.phoneNumber }));
        const token = yield jwt_1.sign(user.toJSON(), req.module.options);
        res.cookie("token", token).json({
            token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postLoginEmail = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_1.default.findOne({
            where: {
                email
            }
        });
        if (!user) {
            throw new http_errors_1.default.NotFound(`Email ${email} not found.`);
        }
        if (!(yield user.comparePassword(password))) {
            throw new http_errors_1.default.BadRequest(`Invalid email or password.`);
        }
        const token = yield jwt_1.sign(user.toJSON(), req.module.options);
        res.cookie("token", token).json({
            token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postLoginPhone = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield express_validator_1.check("phoneNumber")
            .isMobilePhone("any")
            .run(req);
        express_validator_1.validationResult(req).throw();
        const { phoneNumber, password } = req.body;
        const user = yield user_1.default.findOne({
            where: {
                phoneNumber
            }
        });
        if (!user) {
            throw new http_errors_1.default.NotFound(`Phone number ${phoneNumber} not found.`);
        }
        if (!(yield user.comparePassword(password))) {
            throw new http_errors_1.default.BadRequest(`Invalid phone number or password.`);
        }
        const token = yield jwt_1.sign(user.toJSON(), req.module.options);
        res.cookie("token", token).json({
            token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postLogin2fa = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield express_validator_1.check("code", "Code is not valid")
            .exists()
            .run(req);
        express_validator_1.validationResult(req).throw();
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            throw errors;
        }
        yield req.module.twilio.verify
            .services(req.module.options.twilio.verifySid)
            .verificationChecks.create({
            to: req.user.phoneNumber,
            code: req.body.code
        });
        const { phoneNumber } = req.user;
        const user = yield user_1.default.findOne({
            where: {
                phoneNumber
            }
        });
        if (!user) {
            throw new http_errors_1.default.NotFound(`Phone number ${phoneNumber} not found.`);
        }
        const token = yield jwt_1.sign(user.toJSON(), req.module.options);
        res.cookie("token", token).json({
            token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postForgotPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // createRandomToken
        const token = yield new Promise((resolve, reject) => {
            crypto_1.default.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                return resolve(buf.toString("hex"));
            });
        });
        // setRandomToken
        const user = yield user_1.default.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!user) {
            throw new http_errors_1.default.NotFound(`Account with that email address does not exist.`);
        }
        const passwordResetExpires = new Date();
        passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);
        yield user.update({
            passwordResetToken: token,
            passwordResetExpires
        });
        // send Email
        const temp = template_1.default({
            req,
            user: user.get()
        });
        yield req.module.transporter.sendMail({
            to: user.email,
            from: temp(req.module.options.mail.from),
            subject: temp(req.module.options.mail.forgotPasswordSubject),
            text: temp(req.module.options.mail.forgotPassword)
        });
        res.json({
            message: `An e-mail has been sent to ${user.email} with further instructions.`
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postResetPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({
            where: {
                passwordResetToken: req.body.token,
                passwordResetExpires: {
                    [sequelize_1.Op.gt]: Date.now()
                }
            }
        });
        if (!user) {
            throw new http_errors_1.default.BadRequest(`Password reset token is invalid or has expired.`);
        }
        yield user.update({
            password: req.body.password,
            passwordResetToken: null,
            passwordResetExpires: null
        });
        // send Email
        const temp = template_1.default({
            req,
            user: user.get()
        });
        // don't await it
        req.module.transporter.sendMail({
            to: user.email,
            from: temp(req.module.options.mail.from),
            subject: temp(req.module.options.mail.resetPasswordSubject),
            text: temp(req.module.options.mail.resetPassword)
        });
        res.json({
            message: `Success! Your password has been changed.`
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postAccounts = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!user) {
            throw new http_errors_1.default.NotFound(`User ID ${req.params.id} not found.`);
        }
        yield user.update(req.body);
        res.json(user.toJSON());
    }
    catch (error) {
        next(error);
    }
});
exports.deleteAccounts = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({
            where: {
                id: req.params.id
            }
        });
        if (!user) {
            throw new http_errors_1.default.NotFound(`User ID ${req.params.id} not found.`);
        }
        yield user.destroy();
        res.json({
            message: `Your account has been deleted.`
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=users.js.map