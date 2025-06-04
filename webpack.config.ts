import { Compiler, Configuration } from "webpack";
import path from "path";
import fse from "fs-extra";

const currentTask = process.env.npm_lifecycle_event;

class runAfterDone {
  apply(compiler: Compiler): void {
    compiler.hooks.done.tap("copy assets", () => {
      fse.copySync("./src/server/views", "./dist/views");
    });
  }
}

const config: Configuration = {
  entry: {
    main: ["./src/client/main.ts"],
  },
  output: {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist/public"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts"],
    alias: {
      "@": path.resolve(__dirname, "src/client"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
          configFile: "tsconfig.client.json",
        },
      },
    ],
  },
  plugins: [],
};

if (currentTask === "dev") {
  config.mode = "development";
} else if (currentTask === "build") {
  config.mode = "production";
  config.plugins?.push(new runAfterDone());
}

export default config;
