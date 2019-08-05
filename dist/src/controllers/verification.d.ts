import { Response, Request, NextFunction } from "express";
import UserModule from "../../index.d";
declare const _default: (req: Request & {
    module: UserModule;
}, res: Response, next: NextFunction) => Promise<void>;
export default _default;
