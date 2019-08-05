import { Response, Request, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { sign } from "../util/jwt";
import UserModule from "../../index.d";

export default async (
  req: Request & { module: UserModule },
  res: Response,
  next: NextFunction
) => {
  try {
    await check("to", "Phone Number is required")
      .exists()
      .run(req);
    await check("channel")
      .custom(value => value === "sms" || value === "call")
      .optional()
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw errors;
    }

    await req.module.twilio.verify
      .services(req.module.options.twilio.verifySid)
      .verifications.create({
        to: req.body.to,
        channel: req.body.channel || "sms"
      });

    const token = await sign(
      {
        phoneNumber: req.body.to
      },
      req.module.options
    );

    res.cookie("token", token).json({
      token
    });
  } catch (error) {
    next(error);
  }
};
