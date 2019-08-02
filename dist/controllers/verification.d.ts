import { Response, Request, NextFunction } from "express";
import User from "../index";
declare const _default: (req: Request & {
    config: User;
}, res: Response, next: NextFunction) => Promise<void>;
export default _default;
