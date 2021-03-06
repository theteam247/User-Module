import { Router, RequestHandler } from "express";
import { Options as JWTOptions } from "express-jwt";
import { SignOptions } from "jsonwebtoken";
import {
  Sequelize,
  Options as SequelizeOptions,
  ModelAttributes,
  Model,
  ModelOptions,
  InitOptions,
  ModelType
} from "sequelize";
import { TwilioClientOptions } from "twilio/lib/rest/Twilio";
import { Transporter } from "nodemailer";
import { Twilio } from "twilio";
import unless from "express-unless";

export interface UserOptions {
  sequelize: Sequelize | SequelizeOptions;
  jwt: JWTOptions;
  sign?: SignOptions;
  model?: {
    attributes: ModelAttributes,
    options: InitOptions
  };
  nodemailer?: any;
  mail?: {
    from: string;
    signupSubject: string;
    signup: string;
    forgotPasswordSubject: string;
    forgotPassword: string;
    resetPasswordSubject: string;
    resetPassword: string;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    opts: TwilioClientOptions;
    verifySid: string;
  };
}

export interface GuardOptions {
  required?: string | string[] | string[][],
  unless?: unless.Options
}

export default interface UserModule {
  options: UserOptions;
  model: ModelType;
  router: Router;
  transporter: Transporter;
  twilio: Twilio;

  guard:{
    (options?: GuardOptions): RequestHandler[];
  }
}
