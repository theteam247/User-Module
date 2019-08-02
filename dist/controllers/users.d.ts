import { Response, Request, NextFunction } from "express";
import UserModel from "../modals/user";
import User from "../index";
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
export declare const postAccount: (req: Request & {
    config: User;
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAccount: (req: Request & {
    user: UserModel;
}, res: Response, next: NextFunction) => Promise<void>;
