import { Response, Request, NextFunction } from "express";
import UserModel from "../models/user";
import User from "../user-module";
export declare const postSignupEmail: (req: Request & {
    config: User;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postSignupPhone: (req: Request & {
    config: User;
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postLoginEmail: (req: Request & {
    config: User;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postLoginPhone: (req: Request & {
    config: User;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postLogin2fa: (req: Request & {
    config: User;
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postForgotPassword: (req: Request & {
    config: User;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postResetPassword: (req: Request & {
    config: User;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const postAccounts: (req: Request & {
    config: User;
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAccounts: (req: Request & {
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
