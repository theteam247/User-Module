import { Sequelize, ModelAttributes, ModelOptions, Model } from "sequelize";
declare class User extends Model {
    password: string;
    id: string;
    email: string;
    phoneNumber: string;
    permissions: string[];
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
        permissions: string[];
        name: string;
        gender: string;
        picture: string;
        comparePassword: (candidatePassword: string) => Promise<boolean>;
        isNewRecord: boolean;
        sequelize: Sequelize;
    };
    comparePassword: (candidatePassword: string) => Promise<boolean>;
    static define(opts: {
        sequelize: Sequelize;
        attributes?: ModelAttributes;
        options?: ModelOptions;
    }): typeof User;
}
export default User;
