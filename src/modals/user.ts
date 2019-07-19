import bcryptjs from "bcryptjs"
import { INTEGER, STRING, TEXT, DATE, Model, Sequelize, ModelAttributes, ModelOptions } from "sequelize";

class User extends Model {
  private password!: string;
  id!: number;
  email!: string;
  name: string;
  gender: string;
  picture: string;

  activateToken: string;
  activateTokenExpires: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;

  toJSON() {
    const { password, activateToken, activateTokenExpires, passwordResetToken, passwordResetExpires, ...rest } = this.get() as User
    return rest
  }

  comparePassword = async (candidatePassword: string) => {
    return await bcryptjs.compare(candidatePassword, this.password);
  }

  static define(opts: {
    sequelize: Sequelize,
    attributes?: ModelAttributes,
    options?: ModelOptions,
  }) {
    User.init({
      id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: STRING,
        allowNull: false,
        unique: true,
      },
      // hash
      password: {
        type: TEXT,
        allowNull: false
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
      },

      // extra attrs
      ...opts.attributes

    }, {
      sequelize: opts.sequelize,
      ...opts.options,
      hooks: {
        ...(opts.options || {}).hooks,
        beforeCreate: async (user: User) => {
          user.password = await bcryptjs.hash(user.password, 10)
        }
      }
    })

    return User
  }
}

export default User
