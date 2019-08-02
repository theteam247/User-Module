import { Options as JWTOptions } from "express-jwt";
import { SignOptions } from "jsonwebtoken";
import {
  Sequelize,
  Options as SequelizeOptions,
  ModelAttributes,
  Model
} from "sequelize";
import { TwilioClientOptions } from "twilio/lib/rest/Twilio";
import { Router } from "express";
import { Transporter } from "nodemailer";
import { Twilio } from "twilio";
import { RequestHandlerParams } from "express-serve-static-core";
import UserModel from "./src/modals/user";

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

export default interface User {
  options: UserOptions;
  model: typeof UserModel;
  router: Router;
  transporter: Transporter;
  twilio: Twilio;

  middleware:{
    (required: string | string[] | string[][]): RequestHandlerParams;
  }
}