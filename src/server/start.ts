import "dotenv/config";
import path from "path";
import fse from "fs-extra";
import { Response } from "express";
import app from "./app";
import router from "./router";
import { Manifest } from "./utils";

const manifestPath = path.resolve(__dirname, "../dist/manifest.json");
const manifest: Manifest = JSON.parse(fse.readFileSync(manifestPath, "utf-8"));

app.use((req, res: Response, next) => {
  res.locals.manifest = manifest;
  next();
});
app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});
