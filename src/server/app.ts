import express from "express";
import path from "path";

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

export default app;
