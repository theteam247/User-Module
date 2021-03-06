import bcryptjs from "bcryptjs";
import {
  STRING,
  DATE,
  ModelAttributes,
  UUID,
  UUIDV1,
  UUIDV4,
  Model,
  InitOptions
} from "sequelize";

class User extends Model {
  public password: string;
  public id: string;
  public email: string;
  public phoneNumber: string;
  public permissions: string;
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
    attributes?: ModelAttributes;
    options?: InitOptions;
  }) {
    User.init(
      {
        // extra attrs
        ...opts.attributes,

        id: {
          type: UUID,
          allowNull: false,
          defaultValue: UUIDV4,
          primaryKey: true
        },
        email: {
          type: STRING,
          allowNull: true,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        phoneNumber: {
          type: STRING,
          allowNull: true,
          unique: true
        },
        // hash
        password: {
          type: STRING,
          allowNull: false,
          defaultValue: UUIDV1,
          validate: {
            len: [6, Number.MAX_SAFE_INTEGER]
          }
        },
        permissions: {
          type: STRING,
          allowNull: false,
          defaultValue: " "
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
        modelName: "user",
        paranoid: true,
        ...opts.options,
        validate: {
          ...(opts.options.validate || {}),
          emailOrPhone() {
            if (!this.email && !this.phoneNumber) {
              throw new Error("Require either email or phoneNumber");
            }
          }
        },
        hooks: {
          ...(opts.options.hooks || {}),
          async beforeCreate(user: User) {
            user.password = await bcryptjs.hash(user.password, 10);
          },
          async beforeUpdate(user: User) {
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
