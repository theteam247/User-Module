import crypto from "crypto";
import _ from "lodash";
import { Response, Request, NextFunction } from "express";
import createError from "http-errors";
import { check, validationResult } from "express-validator";
import { Op } from "sequelize";
import template from "../util/template";
import { sign } from "../util/jwt";
import User from "../models/user";
import UserModule from "../user-module";

export const postSignupEmail = async (
  req: Request & { module: UserModule },
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name
    });

    // send Email

    const temp = template({
      req,
      user: user.get()
    });

    // don't await it
    req.module.transporter.sendMail({
      to: user.email,
      from: temp(req.module.options.mail.from),
      subject: temp(req.module.options.mail.signupSubject),
      text: temp(req.module.options.mail.signup)
    });

    const token = await sign(user.toJSON(), req.module.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postSignupPhone = async (
  req: Request & { module: UserModule; user: User },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("code", "Code is not valid")
      .exists()
      .run(req);
    validationResult(req).throw();

    await req.module.twilio.verify
      .services(req.module.options.twilio.verifySid)
      .verificationChecks.create({
        to: req.user.phoneNumber,
        code: req.body.code
      });

    const user = await User.create({
      ...req.body,
      phoneNumber: req.user.phoneNumber
    });

    const token = await sign(user.toJSON(), req.module.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postLoginEmail = async (
  req: Request & { module: UserModule },
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email
      }
    });

    if (!user) {
      throw new createError.NotFound(`Email ${email} not found.`);
    }

    if (!(await user.comparePassword(password))) {
      throw new createError.BadRequest(`Invalid email or password.`);
    }

    const token = await sign(user.toJSON(), req.module.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postLoginPhone = async (
  req: Request & { module: UserModule },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("phoneNumber")
      .isMobilePhone("any")
      .run(req);
    validationResult(req).throw();

    const { phoneNumber, password } = req.body;
    const user = await User.findOne({
      where: {
        phoneNumber
      }
    });

    if (!user) {
      throw new createError.NotFound(`Phone number ${phoneNumber} not found.`);
    }

    if (!(await user.comparePassword(password))) {
      throw new createError.BadRequest(`Invalid phone number or password.`);
    }

    const token = await sign(user.toJSON(), req.module.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postLogin2fa = async (
  req: Request & { module: UserModule; user: User },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("code", "Code is not valid")
      .exists()
      .run(req);
    validationResult(req).throw();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    await req.module.twilio.verify
      .services(req.module.options.twilio.verifySid)
      .verificationChecks.create({
        to: req.user.phoneNumber,
        code: req.body.code
      });

    const { phoneNumber } = req.user;
    const user = await User.findOne({
      where: {
        phoneNumber
      }
    });

    if (!user) {
      throw new createError.NotFound(`Phone number ${phoneNumber} not found.`);
    }

    const token = await sign(user.toJSON(), req.module.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const post2fa = async (
  req: Request & { module: UserModule; user: User },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("code", "Code is not valid")
      .exists()
      .run(req);
    validationResult(req).throw();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    await req.module.twilio.verify
      .services(req.module.options.twilio.verifySid)
      .verificationChecks.create({
        to: req.user.phoneNumber,
        code: req.body.code
      });

    const { phoneNumber } = req.user;
    const [user] = await User.findOrCreate({
      where: {
        phoneNumber
      },
      defaults: {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name
      }
    });

    const token = await sign(user.toJSON(), req.module.options);

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};

export const postForgotPassword = async (
  req: Request & { module: UserModule },
  res: Response,
  next: NextFunction
) => {
  try {
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
    const user = await User.findOne({
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

    // send Email

    const temp = template({
      req,
      user: user.get()
    });

    await req.module.transporter.sendMail({
      to: user.email,
      from: temp(req.module.options.mail.from),
      subject: temp(req.module.options.mail.forgotPasswordSubject),
      text: temp(req.module.options.mail.forgotPassword)
    });

    res.json({
      message: `An e-mail has been sent to ${user.email} with further instructions.`
    });
  } catch (error) {
    next(error);
  }
};

export const postResetPassword = async (
  req: Request & { module: UserModule },
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({
      where: {
        passwordResetToken: req.body.token,
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
      passwordResetToken: null,
      passwordResetExpires: null
    });

    // send Email

    const temp = template({
      req,
      user: user.get()
    });

    // don't await it
    req.module.transporter.sendMail({
      to: user.email,
      from: temp(req.module.options.mail.from),
      subject: temp(req.module.options.mail.resetPasswordSubject),
      text: temp(req.module.options.mail.resetPassword)
    });

    res.json({
      message: `Success! Your password has been changed.`
    });
  } catch (error) {
    next(error);
  }
};

export const postAccounts = async (
  req: Request & { module: UserModule },
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!user) {
      throw new createError.NotFound(`User ID ${req.params.id} not found.`);
    }

    await user.update(req.body);

    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const deleteAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!user) {
      throw new createError.NotFound(`User ID ${req.params.id} not found.`);
    }

    await user.destroy();

    res.json({
      message: `Your account has been deleted.`
    });
  } catch (error) {
    next(error);
  }
};
