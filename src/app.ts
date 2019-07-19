import express from "express";
import lusca from "lusca";
import User from ".";
import { jwt, sequelize } from "./util/secrets";

const user = new User({
  jwt,
  sequelize
});

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use("/v1", user.router);

export default app;
