import bcryptjs from "bcryptjs";
import {
  INTEGER,
  STRING,
  TEXT,
  DATE,
  Model,
  Sequelize,
  ModelAttributes,
  ModelOptions,
  ARRAY
} from "sequelize";

class User extends Model {
  public password!: string;
  public id!: number;
  public email!: string;
  public permissions: string[];
  public name: string;
  public gender: string;
  public picture: string;

  public activateToken: string;
  public activateTokenExpires: Date;
  public passwordResetToken: string;
  public passwordResetExpires: Date;

  public toJSON() {
    const {
      password,
      activateToken,
      activateTokenExpires,
      passwordResetToken,
      passwordResetExpires,
      ...rest
    } = this.get() as User;
    return rest;
  }

  public comparePassword = async (candidatePassword: string) => {
    return await bcryptjs.compare(candidatePassword, this.password);
  };

  public static define(opts: {
    sequelize: Sequelize;
    attributes?: ModelAttributes;
    options?: ModelOptions;
  }) {
    User.init(
      {
        // extra attrs
        ...opts.attributes,

        id: {
          type: INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        email: {
          type: STRING,
          allowNull: false,
          unique: true
        },
        // hash
        password: {
          type: TEXT,
          allowNull: false
        },
        permissions: {
          type: STRING,
          allowNull: false,
          defaultValue: ""
        },

        // profile
        name: {
          type: STRING,
          allowNull: true
        },
        gender: {
          type: STRING,
          allowNull: true
        },
        picture: {
          type: STRING,
          allowNull: true
        },

        // send email with activateToken after registration
        activateToken: {
          type: STRING,
          allowNull: true
        },
        activateTokenExpires: {
          type: DATE,
          allowNull: true
        },

        // send email with passwordResetToken after reqeusting to reset password
        passwordResetToken: {
          type: STRING,
          allowNull: true
        },
        passwordResetExpires: {
          type: DATE,
          allowNull: true
        }
      },
      {
        sequelize: opts.sequelize,
        ...opts.options,
        paranoid: true,
        hooks: {
          ...(opts.options || {}).hooks,
          beforeCreate: async (user: User) => {
            user.password = await bcryptjs.hash(user.password, 10);
          },
          beforeUpdate: async (user: User) => {
            const password = await bcryptjs.hash(user.password, 10);
            user.set({
              ...user.toJSON(),
              password
            });
          }
        }
      }
    );

    return User;
  }
}

export default User;
