import { Transporter } from "nodemailer";
import { Twilio } from "twilio";
import express, { Router } from "express";
import UserModule, { UserOptions } from "../index.d";
import User from "./models/user";
declare class Module implements UserModule {
    options: UserOptions;
    router: Router;
    model: typeof User;
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
