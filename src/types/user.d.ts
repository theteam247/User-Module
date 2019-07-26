import { Options as JWTOptions } from "express-jwt";
import { SignOptions } from "jsonwebtoken";
import {
  Sequelize,
  Options as SequelizeOptions,
  ModelAttributes
} from "sequelize";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface UserOptions {
  jwt: JWTOptions & SignOptions;
  sequelize: Sequelize | SequelizeOptions;
  model?: ModelAttributes;
  nodemailer?: any;
  mail?: {
    from: string;
    template: {
      activate: string;
      forgotPassword: string;
      resetPassword: string;
    };
  };
}

declare module "user";
