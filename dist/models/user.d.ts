import { ModelAttributes, Model, InitOptions } from "sequelize";
declare class User extends Model {
    password: string;
    id: string;
    email: string;
    phoneNumber: string;
    permissions: string;
    name: string;
    gender: string;
    picture: string;
    activateToken: string;
    activateTokenExpires: Date;
    passwordResetToken: string;
    passwordResetExpires: Date;
    toJSON(): {
        id: string;
        email: string;
        phoneNumber: string;
        permissions: string;
        name: string;
        gender: string;
        picture: string;
        comparePassword: (candidatePassword: string) => Promise<boolean>;
        isNewRecord: boolean;
        sequelize: import("sequelize/types").Sequelize;
    };
    comparePassword: (candidatePassword: string) => Promise<boolean>;
    static define(opts: {
        attributes?: ModelAttributes;
        options?: InitOptions;
    }): typeof User;
}
export default User;
