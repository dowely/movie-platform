import "dotenv/config";
import app from "./app";
import router from "./router";

app.use("/", router);

app.listen(process.env.PORT);
