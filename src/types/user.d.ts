import { Options as JWTOptions } from "express-jwt";
import { SignOptions } from "jsonwebtoken";
import {
  Sequelize,
  Options as SequelizeOptions,
  ModelAttributes
} from "sequelize";

export interface SendGridOptions {
  from: string;
  username: string;
  password: string;
  template: {
    forgotPassword: string;
    resetPassword: string;
  };
}

export interface UserOptions {
  jwt: JWTOptions & SignOptions;
  sequelize: Sequelize | SequelizeOptions;
  model?: ModelAttributes;
  sendgrid: SendGridOptions;
}

declare module "user";
