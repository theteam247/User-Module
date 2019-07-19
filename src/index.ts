
import crypto from "crypto";
import nodemailer from "nodemailer";
import express, { Response, Request, NextFunction, Router } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import { check, sanitize, validationResult } from "express-validator";
import JWT, { RequestHandler, Options as JWTOptions } from "express-jwt"
import jsonwebtoken, { SignOptions } from "jsonwebtoken"
import { Sequelize, Options as SequelizeOptions, ModelAttributes} from "sequelize"
import UserModel from './modals/user'

export interface UserOptions {
  jwt: JWTOptions & SignOptions;
  sequelize: Sequelize | SequelizeOptions;
  model?: ModelAttributes;
}

class User {
  options: UserOptions;

  sequelize: Sequelize;
  middleware: RequestHandler;
  router: Router;

  constructor(options: UserOptions) {
    this.options = options;

    this.initSequlize();
    this.initJWT();
    this.initRouter();
  }

  private initSequlize() {
    this.sequelize = this.options.sequelize instanceof Sequelize ? this.options.sequelize : (new Sequelize(this.options.sequelize));

    UserModel.define({
      sequelize: this.sequelize,
      attributes: this.options.model
    }).sync()

  }

  private initJWT() {
    this.middleware = JWT(this.options.jwt)
  }

  private initRouter() {
    this.router = express.Router();

    // middleware that is specific to this router
    this.router.use(express.json());
    this.router.use(bodyParser.json());
    this.router.use(bodyParser.urlencoded({
      extended: true
    }));
    this.router.use(compression());

    
    this.router.post("/signup", this.postSignup);
    this.router.post("/login", this.postLogin);
    this.router.post("/account", this.postAccount);
    this.router.delete("/account", this.deleteAccount);
    this.router.post("/password/forgot", this.postForgotPassword);
    this.router.post("/password/reset", this.postResetPassword);

    this.router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(500).json({
        error
      })
    })
  }

  private postSignup = async (req: Request, res: Response, next: NextFunction) => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password must be at least 4 characters long").isLength({ min: 6 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json(errors)
    }

    const userFound = await UserModel.findOne({
      where: {
        email: req.body.email
      }
    })

    if(userFound) {
      return res.status(400).json({
        error: `Account with that email address already exists.`
      })
    }

    const userCreated = await UserModel.create({
      email: req.body.email,
      password: req.body.password
    })
    
    const { secret, ...jwtOptions } = this.options.jwt
    jsonwebtoken.sign(userCreated.toJSON(), secret as string, jwtOptions, (err, token) => {
      if(err) {
        return res.status(400).json(err);
      }

      res.json({
        token,
      })
    })
  }

  private postLogin = async (req: Request, res: Response, next: NextFunction) => {
    await check("email").isEmail().run(req);
    await check("password").isLength({
      min: 6
    }).run(req);
    await sanitize("email").normalizeEmail({
      gmail_remove_dots: false
    }).run(req);

    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json(errors)
    }


    const { email, password } = req.body
    const user = await UserModel.findOne({
      where: {
        email: email.toLowerCase()
      }
    })

    if(!user) {
      return res.status(400).json({
        error: `Email ${email} not found.`
      })
    }

    if(!user.comparePassword(password)) {
      return res.status(400).json({
        error: `Invalid email or password.`
      })
    }

    const { secret, ...jwtOptions } = this.options.jwt
    jsonwebtoken.sign(user.toJSON(), secret as string, jwtOptions, (err, token) => {
      if(err) {
        return res.status(400).json(err);
      }

      res.json({
        token,
      })
    })
  }

  private postAccount = async (req: Request, res: Response, next: NextFunction) => {}
  private deleteAccount = async (req: Request, res: Response, next: NextFunction) => {}

  private postForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await check("email").isEmail().run(req);
    await sanitize("email").normalizeEmail({
      gmail_remove_dots: false
    }).run(req);

    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json(errors)
    }

    // createRandomToken
    const token = await new Promise<string>((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if(err) {
          return reject(err)
        }
        return resolve(buf.toString("hex"));
      })
    })

    // setRandomToken
    const user = await UserModel.findOne({
      where: {
        email: req.body.email
      }
    })
    if (!user) {
      return res.status(400).json({
        error: `Account with that email address does not exist.`
      })
    }

    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);

    await user.update({
      passwordResetToken: token,
      passwordResetExpires
    });

    // sendForgotPasswordEmail
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    })
    
    await transporter.sendMail({
      to: user.email,
      from: process.env.SENDGRID_FROM,
      subject: `Reset your password on Hackathon Starter`,
      text: `http://${req.headers.host}/reset/${token}`
    })

  }

  private postResetPassword = async (req: Request, res: Response, next: NextFunction) => {}
}

export default User
