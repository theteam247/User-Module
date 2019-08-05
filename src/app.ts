import express from "express";
import lusca from "lusca";
import UserModule from "./index";
import env from "./global/env";

const user = new UserModule(env as any);

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use("/v1", user.router);

export default app;
