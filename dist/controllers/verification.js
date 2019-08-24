"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const jwt_1 = require("../util/jwt");
exports.default = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield express_validator_1.check("to", "Phone Number is required")
            .isMobilePhone("any")
            .run(req);
        yield express_validator_1.check("channel")
            .custom(value => value === "sms" || value === "call")
            .optional()
            .run(req);
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            throw errors;
        }
        yield req.module.twilio.verify
            .services(req.module.options.twilio.verifySid)
            .verifications.create({
            to: req.body.to,
            channel: req.body.channel || "sms"
        });
        const token = yield jwt_1.sign({
            phoneNumber: req.body.to,
            permissions: " "
        }, req.module.options);
        res.cookie("token", token).json({
            token
        });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=verification.js.map