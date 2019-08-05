import dotenv from "dotenv";
import express from "express";
import lusca from "lusca";
import UserModule from "./index";

dotenv.config();

const user = new UserModule();

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use("/v1", user.router);

export default app;
