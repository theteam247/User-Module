import crypto from "crypto";
import _ from "lodash";
import dot from "dot-object";
import nodemailer, { Transporter } from "nodemailer";
import express, { Response, Request, NextFunction, Router } from "express";
import createError from "http-errors";
import compression from "compression";
import bodyParser from "body-parser";
import { check, sanitize, validationResult } from "express-validator";
import JWT from "express-jwt";
import jsonwebtoken from "jsonwebtoken";
import permissions from "express-jwt-permissions";
import { Sequelize, Op } from "sequelize";
import UserModel from "./modals/user";
import template from "./util/template";
import { UserOptions } from "./types/user";

const guard = permissions({});

class User {
  private sequelize: Sequelize;
  private transporter: Transporter;

  public options: UserOptions;
  public router: Router;
  public middleware(required: string | string[] | string[][] = "") {
    return [JWT(this.options.jwt), guard.check(required)];
  }

  public constructor(options?: UserOptions) {
    const env = {
      ...process.env
    };
    dot.object(env);
    this.options = _.merge(env, options);

    this.initSequlize();
    this.initRouter();
    this.initTransport();
  }

  private initSequlize() {
    this.sequelize =
      this.options.sequelize instanceof Sequelize
        ? this.options.sequelize
        : new Sequelize(this.options.sequelize);

    UserModel.define({
      sequelize: this.sequelize,
      attributes: this.options.model
    }).sync();
  }

  private initTransport() {
    this.transporter = nodemailer.createTransport(this.options.nodemailer);
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

    this.router.post("/signup", this.postSignup);
    this.router.post("/login", this.postLogin);
    this.router.post("/password/forgot", this.postForgotPassword);
    this.router.post("/password/reset", this.postResetPassword);

    this.router.post("/account", this.middleware(), this.postAccount);
    this.router.delete("/account", this.middleware(), this.deleteAccount);

    this.router.use(
      (error: Error, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof createError.HttpError) {
          return res.status(error.status).json(error);
        }

        return res.status(500).json(error);
      }
    );
  }

  private postSignup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await check("email", "Email is not valid")
        .isEmail()
        .run(req);
      await check("password", "Password must be at least 4 characters long")
        .isLength({ min: 6 })
        .run(req);
      await sanitize("email")
        .normalizeEmail({ gmail_remove_dots: false })
        .run(req);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw errors;
      }

      const userFound = await UserModel.findOne({
        where: {
          email: req.body.email
        }
      });

      if (userFound) {
        throw new createError.NotFound(
          `Account with that email address already exists.`
        );
      }

      const user = await UserModel.create({
        email: req.body.email,
        password: req.body.password
      });

      const { secret, ...jwtOptions } = this.options.jwt;
      jsonwebtoken.sign(
        user.toJSON(),
        secret as string,
        jwtOptions,
        (err, token) => {
          if (err) {
            return res.status(400).json(err);
          }

          // TODO: send email

          res.json({
            token
          });
        }
      );
    } catch (error) {
      next(error);
    }
  };

  private postLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await check("email")
        .isEmail()
        .run(req);
      await check("password")
        .isLength({
          min: 6
        })
        .run(req);
      await sanitize("email")
        .normalizeEmail({
          gmail_remove_dots: false
        })
        .run(req);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw errors;
      }

      const { email, password } = req.body;
      const user = await UserModel.findOne({
        where: {
          email: email.toLowerCase()
        }
      });

      if (!user) {
        throw new createError.NotFound(`Email ${email} not found.`);
      }

      if (!user.comparePassword(password)) {
        throw new createError.BadRequest(`Invalid email or password.`);
      }

      const { secret, ...jwtOptions } = this.options.jwt;
      jsonwebtoken.sign(
        user.toJSON(),
        secret as string,
        jwtOptions,
        (err, token) => {
          if (err) {
            return res.status(400).json(err);
          }

          res.json({
            token
          });
        }
      );
    } catch (error) {
      next(error);
    }
  };

  private postForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await check("email")
        .isEmail()
        .run(req);
      await sanitize("email")
        .normalizeEmail({
          gmail_remove_dots: false
        })
        .run(req);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw errors;
      }

      // createRandomToken
      const token = await new Promise<string>((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          return resolve(buf.toString("hex"));
        });
      });

      // setRandomToken
      const user = await UserModel.findOne({
        where: {
          email: req.body.email
        }
      });
      if (!user) {
        throw new createError.NotFound(
          `Account with that email address does not exist.`
        );
      }

      const passwordResetExpires = new Date();
      passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);

      await user.update({
        passwordResetToken: token,
        passwordResetExpires
      });

      await this.transporter.sendMail({
        to: user.email,
        from: this.options.mail.from,
        subject: "Reset your password on Hackathon Starter",
        text: template(this.options.mail.template.forgotPassword)(user as any)
      });

      res.json({
        message: `An e-mail has been sent to ${user.email} with further instructions.`
      });
    } catch (error) {
      next(error);
    }
  };

  private postResetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await UserModel.findOne({
        where: {
          passwordResetToken: req.params.token,
          passwordResetExpires: {
            [Op.gt]: Date.now()
          }
        }
      });

      if (!user) {
        throw new createError.BadRequest(
          `Password reset token is invalid or has expired.`
        );
      }

      await user.update({
        password: req.body.password,
        passwordResetToken: undefined,
        passwordResetExpires: undefined
      });

      // sendResetPasswordEmail

      await this.transporter.sendMail({
        to: user.email,
        from: this.options.mail.from,
        subject: "Your password has been changed",
        text: template(this.options.mail.template.resetPassword)(user as any)
      });

      res.json({
        message: `Success! Your password has been changed.`
      });
    } catch (error) {
      next(error);
    }
  };

  private postAccount = async (
    req: Request & { user: UserModel },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await UserModel.findOne({
        where: {
          id: req.user.id
        }
      });

      if (!user) {
        throw new createError.NotFound(`User ID ${req.user.id} not found.`);
      }

      await user.update(req.body);

      res.json(user.toJSON());
    } catch (error) {
      next(error);
    }
  };

  private deleteAccount = async (
    req: Request & { user: UserModel },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await UserModel.findOne({
        where: {
          id: req.user.id
        }
      });

      if (!user) {
        throw new createError.NotFound(`User ID ${req.user.id} not found.`);
      }

      await user.destroy();

      res.json({
        message: `Your account has been deleted.`
      });
    } catch (error) {
      next(error);
    }
  };
}

export default User;
