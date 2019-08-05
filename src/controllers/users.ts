import crypto from "crypto";
import _ from "lodash";
import { Response, Request, NextFunction } from "express";
import createError from "http-errors";
import { check, validationResult } from "express-validator";
import { Op } from "sequelize";
import UserModel from "../models/user";
import template from "../util/template";
import User from "../user-module";
import { sign } from "../util/jwt";

export const postSignupEmail = async (
  req: Request & { config: User },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("email", "Email is not valid")
      .normalizeEmail({ gmail_remove_dots: false })
      .isEmail()
      .run(req);
    await check("password", "Password must be at least 4 characters long")
      .isLength({ min: 6 })
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    const user = await UserModel.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name
    });

    const token = await sign(user.toJSON(), req.config.options);

    // TODO: send email

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postSignupPhone = async (
  req: Request & { config: User; user: UserModel },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("code", "Code is not valid")
      .exists()
      .run(req);

    await check("password", "Password must be at least 4 characters long")
      .isLength({ min: 6 })
      .optional()
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    await req.config.twilio.verify
      .services(req.config.options.twilio.verifySid)
      .verificationChecks.create({
        to: req.user.phoneNumber,
        code: req.body.code
      });

    const user = await UserModel.create({
      ...req.body,
      phoneNumber: req.user.phoneNumber
    });

    const token = await sign(user.toJSON(), req.config.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postLoginEmail = async (
  req: Request & { config: User },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("email")
      .normalizeEmail({ gmail_remove_dots: false })
      .isEmail()
      .run(req);
    await check("password")
      .isLength({
        min: 6
      })
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    const { email, password } = req.body;
    const user = await UserModel.findOne({
      where: {
        email
      }
    });

    if (!user) {
      throw new createError.NotFound(`Email ${email} not found.`);
    }

    if (!user.comparePassword(password)) {
      throw new createError.BadRequest(`Invalid email or password.`);
    }

    const token = await sign(user.toJSON(), req.config.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postLoginPhone = async (
  req: Request & { config: User },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("phoneNumber")
      .exists()
      .run(req);
    await check("password")
      .isLength({
        min: 6
      })
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    const { phoneNumber, password } = req.body;
    const user = await UserModel.findOne({
      where: {
        phoneNumber
      }
    });

    if (!user) {
      throw new createError.NotFound(`Phone number ${phoneNumber} not found.`);
    }

    if (!user.comparePassword(password)) {
      throw new createError.BadRequest(`Invalid phone number or password.`);
    }

    const token = await sign(user.toJSON(), req.config.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postLogin2fa = async (
  req: Request & { config: User; user: UserModel },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("code", "Code is not valid")
      .exists()
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    await req.config.twilio.verify
      .services(req.config.options.twilio.verifySid)
      .verificationChecks.create({
        to: req.user.phoneNumber,
        code: req.body.code
      });

    const { phoneNumber } = req.user;
    const user = await UserModel.findOne({
      where: {
        phoneNumber
      }
    });

    if (!user) {
      throw new createError.NotFound(`Phone number ${phoneNumber} not found.`);
    }

    const token = await sign(user.toJSON(), req.config.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postForgotPassword = async (
  req: Request & { config: User },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("email")
      .normalizeEmail({ gmail_remove_dots: false })
      .isEmail()
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

    await req.config.transporter.sendMail({
      to: user.email,
      from: req.config.options.mail.from,
      subject: "Reset your password on Hackathon Starter",
      text: template(req.config.options.mail.template.forgotPassword)(
        user as any
      )
    });

    res.json({
      message: `An e-mail has been sent to ${user.email} with further instructions.`
    });
  } catch (error) {
    next(error);
  }
};

export const postResetPassword = async (
  req: Request & { config: User },
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

    await req.config.transporter.sendMail({
      to: user.email,
      from: req.config.options.mail.from,
      subject: "Your password has been changed",
      text: template(req.config.options.mail.template.resetPassword)(
        user as any
      )
    });

    res.json({
      message: `Success! Your password has been changed.`
    });
  } catch (error) {
    next(error);
  }
};

export const postAccount = async (
  req: Request & { config: User; user: UserModel },
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

export const deleteAccount = async (
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
