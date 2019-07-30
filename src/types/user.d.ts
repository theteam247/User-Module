import { Options as JWTOptions } from "express-jwt";
import { SignOptions } from "jsonwebtoken";
import {
  Sequelize,
  Options as SequelizeOptions,
  ModelAttributes
} from "sequelize";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { TwilioClientOptions } from "twilio/lib/rest/Twilio";

export interface UserOptions {
  jwt: JWTOptions;
  sign: SignOptions;
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
  twilio?: {
    accountSid: string;
    authToken: string;
    opts: TwilioClientOptions;
    verifySid: string;
  };
}

declare module "user";
