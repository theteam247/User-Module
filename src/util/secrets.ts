import dotenv from "dotenv";
import { Options as SequelizeOptions } from "sequelize";
import { Options as JWTOptions } from "express-jwt";
import { SignOptions } from "jsonwebtoken";
dotenv.config();

export const ENVIRONMENT = process.env.NODE_ENV;

export const jwt: JWTOptions & SignOptions = {
  secret: process.env.JWT_SECRET
};

export const sequelize: SequelizeOptions = {
  dialect: process.env.DB_DIALECT as any,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
};
