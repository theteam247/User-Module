import dotenv from "dotenv-flow";
import dot from "dot-object";

dotenv.config();
const configs = {
  ...process.env
};
dot.object(configs);
export default configs;
