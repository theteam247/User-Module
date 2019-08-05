import _ from "lodash";
import dotenv from "dotenv-flow";
import dot from "dot-object";

dotenv.config();
const configs = {
  ...process.env
};
dot.object(configs);
_.merge(
  {
    mail: {
      template: {
        forgotPassword:
          "You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${req.hostname}/reset/${user.passwordResetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n",
        resetPassword:
          "Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed."
      }
    }
  },
  configs
);

export default configs;
