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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    constructor() {
        super(...arguments);
        this.comparePassword = (candidatePassword) => __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(candidatePassword, this.password);
        });
    }
    toJSON() {
        const _a = this.get(), { password, activateToken, activateTokenExpires, passwordResetToken, passwordResetExpires } = _a, rest = __rest(_a, ["password", "activateToken", "activateTokenExpires", "passwordResetToken", "passwordResetExpires"]);
        return rest;
    }
    static define(opts) {
        User.init(Object.assign({}, opts.attributes, { id: {
                type: sequelize_1.UUID,
                allowNull: false,
                defaultValue: sequelize_1.UUIDV4,
                primaryKey: true
            }, email: {
                type: sequelize_1.STRING,
                allowNull: true,
                unique: true,
                validate: {
                    isEmail: true
                }
            }, phoneNumber: {
                type: sequelize_1.STRING,
                allowNull: true,
                unique: true
            }, 
            // hash
            password: {
                type: sequelize_1.STRING,
                allowNull: false,
                defaultValue: sequelize_1.UUIDV1,
                validate: {
                    len: [6, Number.MAX_SAFE_INTEGER]
                }
            }, permissions: {
                type: sequelize_1.STRING,
                allowNull: false,
                defaultValue: ""
            }, 
            // profile
            name: {
                type: sequelize_1.STRING,
                allowNull: true
            }, gender: {
                type: sequelize_1.STRING,
                allowNull: true
            }, picture: {
                type: sequelize_1.STRING,
                allowNull: true
            }, 
            // send email with activateToken after registration
            activateToken: {
                type: sequelize_1.STRING,
                allowNull: true
            }, activateTokenExpires: {
                type: sequelize_1.DATE,
                allowNull: true
            }, 
            // send email with passwordResetToken after reqeusting to reset password
            passwordResetToken: {
                type: sequelize_1.STRING,
                allowNull: true
            }, passwordResetExpires: {
                type: sequelize_1.DATE,
                allowNull: true
            } }), Object.assign({ paranoid: true, tableName: "user" }, opts.options, { validate: Object.assign({}, (opts.options.validate || {}), { emailOrPhone() {
                    if (!this.email && !this.phoneNumber) {
                        throw new Error("Require either email or phoneNumber");
                    }
                } }), hooks: Object.assign({}, (opts.options.hooks || {}), { beforeCreate(user) {
                    return __awaiter(this, void 0, void 0, function* () {
                        user.password = yield bcryptjs_1.default.hash(user.password, 10);
                    });
                },
                beforeUpdate(user) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const password = yield bcryptjs_1.default.hash(user.password, 10);
                        user.set(Object.assign({}, user.toJSON(), { password }));
                    });
                } }) }));
        return User;
    }
}
exports.default = User;
//# sourceMappingURL=user.js.map