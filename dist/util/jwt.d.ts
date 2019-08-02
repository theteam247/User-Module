/// <reference types="node" />
import { UserOptions } from "../types/user.d";
export declare const sign: (payload: string | object | Buffer, options: UserOptions) => Promise<unknown>;
