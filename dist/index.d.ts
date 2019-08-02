import { Transporter } from "nodemailer";
import { Twilio } from "twilio";
import express, { Router } from "express";
import User, { UserOptions } from "./index.d";
declare class UserModule implements User {
    options: UserOptions;
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
export default UserModule;
