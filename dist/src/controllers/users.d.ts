import { Response, Request, NextFunction } from "express";
import UserModel from "../models/user";
import UserModule from "../user-module";
export declare const postSignupEmail: (req: Request & {
    module: UserModule;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postSignupPhone: (req: Request & {
    module: UserModule;
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postLoginEmail: (req: Request & {
    module: UserModule;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postLoginPhone: (req: Request & {
    module: UserModule;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postLogin2fa: (req: Request & {
    module: UserModule;
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postForgotPassword: (req: Request & {
    module: UserModule;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postResetPassword: (req: Request & {
    module: UserModule;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postAccounts: (req: Request & {
    module: UserModule;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAccounts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
