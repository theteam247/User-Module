"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user = {
    id: {
        type: sequelize_1.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: sequelize_1.STRING,
        allowNull: false,
        unique: true,
    },
    // hash
    password: {
        type: sequelize_1.TEXT,
        allowNull: false
    },
    // profile
    name: {
        type: sequelize_1.STRING,
        allowNull: true
    },
    gender: {
        type: sequelize_1.STRING,
        allowNull: true
    },
    picture: {
        type: sequelize_1.STRING,
        allowNull: true
    },
    // send email with activateToken after registration
    activateToken: {
        type: sequelize_1.STRING,
        allowNull: true
    },
    activateTokenExpires: {
        type: sequelize_1.DATE,
        allowNull: true
    },
    // send email with passwordResetToken after reqeusting to reset password
    passwordResetToken: {
        type: sequelize_1.STRING,
        allowNull: true
    },
    passwordResetExpires: {
        type: sequelize_1.DATE,
        allowNull: true
    },
};
exports.default = user;
//# sourceMappingURL=user.js.map