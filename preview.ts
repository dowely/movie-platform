import "dotenv/config";
import chalk from "chalk";
import { Response } from "express";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import webpack from "webpack";
import webpackConfig from "./webpack.config";
import app from "./src/server/app";
import router from "./src/server/router";

const liveReloadServer = livereload.createServer();
const compiler = webpack(webpackConfig);

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output?.publicPath,
  })
);
app.use(webpackHotMiddleware(compiler));
app.use(connectLiveReload());
app.use((req, res: Response, next) => {
  res.locals.manifest = { main: "/main.js" };
  next();
});
app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(
    chalk.blueBright(`Server running on http://localhost:${process.env.PORT}`)
  );
});
