import JsonWebToken from "jsonwebtoken";
import { UserOptions } from "../types/user.d";

export const sign = (
  payload: string | object | Buffer,
  options: UserOptions
) => {
  return new Promise((resolve, reject) => {
    JsonWebToken.sign(
      payload,
      options.jwt.secret as string,
      {
        ...options.sign
      },
      (err, token) => {
        if (err) {
          return reject(err);
        }

        resolve(token);
      }
    );
  });
};
