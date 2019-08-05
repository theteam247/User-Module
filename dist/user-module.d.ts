import { Transporter } from "nodemailer";
import { Twilio } from "twilio";
import express, { Router } from "express";
import UserModule, { UserOptions, UserModel } from "../index.d";
declare class Module implements UserModule {
    options: UserOptions;
    model: UserModel;
    router: Router;
    middleware(required?: string | string[] | string[][]): express.Handler[];
    transporter: Transporter;
    twilio: Twilio;
    constructor(options?: UserOptions);
    private initSequlize;
    private initRouter;
    private initTransporter;
    private initTwilio;
}
export default Module;
