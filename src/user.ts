import _ from "lodash";
import dot from "dot-object";
import nodemailer, { Transporter } from "nodemailer";
import twilio, { Twilio } from "twilio";
import express, { Response, Request, NextFunction, Router } from "express";
import createError from "http-errors";
import compression from "compression";
import bodyParser from "body-parser";
import jwt from "express-jwt";
import permissions from "express-jwt-permissions";
import { Sequelize } from "sequelize";
import UserModel from "./modals/user";
import * as users from "./controllers/users";
import verification from "./controllers/verification";
import User, { UserOptions } from "../index.d";

const guard = permissions({});

class UserModule implements User {
  public options: UserOptions;
  public router: Router;
  public middleware(required: string | string[] | string[][] = "") {
    return [
      jwt(this.options.jwt),
      ...(required && required.length ? [guard.check(required)] : [])
    ];
  }

  public transporter: Transporter;
  public twilio: Twilio;

  public constructor(options?: UserOptions) {
    const env = {
      ...process.env
    };
    dot.object(env);
    this.options = _.merge(
      env,
      {
        jwt: {
          getToken: (req: Request) => {
            if (
              req.headers.authorization &&
              req.headers.authorization.split(" ")[0] === "Bearer"
            ) {
              return req.headers.authorization.split(" ")[1];
            } else if (req.query && req.query.token) {
              return req.query.token;
            } else if (req.cookies && req.cookies.token) {
              return req.cookies.token;
            }
            return null;
          }
        }
      },
      options
    );

    this.initSequlize();
    this.initTransporter();
    this.initTwilio();
    this.initRouter();
  }

  private initSequlize() {
    const sequelize =
      this.options.sequelize instanceof Sequelize
        ? this.options.sequelize
        : new Sequelize(this.options.sequelize);

    UserModel.define({
      sequelize: sequelize,
      attributes: this.options.model
    }).sync();
  }

  private initRouter() {
    this.router = express.Router();

    // middleware that is specific to this router
    this.router.use(express.json());
    this.router.use(bodyParser.json());
    this.router.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    this.router.use(compression());
    this.router.use((req: Request & { config: User }, res, next) => {
      req.config = this;
      next();
    });

    if (this.options.twilio) {
      this.router.post("/verification", verification);
      this.router.post(
        "/signup/phone",
        this.middleware(),
        users.postSignupPhone
      );
      this.router.post("/login/2fa", this.middleware(), users.postLogin2fa);
    }
    this.router.post("/signup/email", users.postSignupEmail);
    this.router.post("/login/email", users.postLoginEmail);
    this.router.post("/login/phone", users.postLoginPhone);

    this.router.post("/password/forgot", users.postForgotPassword);
    this.router.post("/password/reset", users.postResetPassword);

    this.router.post("/account", this.middleware(), users.postAccount);
    this.router.delete("/account", this.middleware(), users.deleteAccount);

    this.router.use(
      (error: Error, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof createError.HttpError) {
          return res.status(error.status).json(error);
        }

        const err = JSON.stringify(error);

        return res.status(500).json(
          err === "{}"
            ? {
                message: error.message
              }
            : error
        );
      }
    );
  }

  private initTransporter() {
    this.transporter = nodemailer.createTransport(this.options.nodemailer);
  }

  private initTwilio() {
    this.twilio = twilio(
      this.options.twilio.accountSid,
      this.options.twilio.authToken,
      this.options.twilio.opts
    );
  }
}

export default UserModule;
