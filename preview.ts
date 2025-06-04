import "dotenv/config";
import chalk from "chalk";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import app from "./src/server/app";
import router from "./src/server/router";

const liveReloadServer = livereload.createServer();

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(connectLiveReload());
app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(
    chalk.blueBright(`Server running on http://localhost:${process.env.PORT}`)
  );
});
