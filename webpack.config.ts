import webpack, { Compiler, Configuration } from "webpack";
import path from "path";
import fse from "fs-extra";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";

const currentTask = process.env.npm_lifecycle_event;

class runAfterDone {
  apply(compiler: Compiler): void {
    compiler.hooks.done.tap("copy assets", () => {
      fse.copySync("./src/server/views", "./dist/views");
    });
    compiler.hooks.done.tap("Clean licences", () => {
      const allFiles = fse
        .readdirSync("./dist/public")
        .map((file) => path.join(__dirname, "dist/public", file));

      allFiles.forEach((path) => {
        if (path.endsWith("LICENSE.txt")) {
          fse.removeSync(path);
        }
      });
    });
  }
}

const manifestGenerator = (
  seed,
  files: Array<{ name: string; path: string }>
) => {
  const manifest = {};

  for (const file of files) {
    const entryName = file.path.substring(1, file.path.indexOf("."));

    manifest[entryName] = file.path;
  }
  return manifest;
};

const cssRule = {
  test: /\.scss$/,
  use: ["css-loader", "sass-loader"],
};

const config: Configuration = {
  target: "web",
  entry: {
    main: ["./src/client/main.ts"],
  },
  output: {
    path: path.resolve(__dirname, "dist/public"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "@": path.resolve(__dirname, "src/client"),
    },
  },
  module: {
    rules: [
      cssRule,
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
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
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(false),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    }),
  ],
};

if (currentTask === "dev") {
  config.mode = "development";
  config.output!.filename = "[name].js";
  config.stats = "minimal";

  cssRule.use.unshift("style-loader");

  (config.entry as { [key: string]: string[] }).main.unshift(
    "webpack-hot-middleware/client"
  );
  config.plugins!.push(new webpack.HotModuleReplacementPlugin());
}

if (currentTask === "build") {
  config.mode = "production";
  config.output!.filename = "[name].[contenthash].js";

  cssRule.use.unshift(MiniCssExtractPlugin.loader);

  config.plugins?.push(
    new MiniCssExtractPlugin({
      filename: "styles.[contenthash].css",
    }),
    new WebpackManifestPlugin({
      fileName: path.resolve(__dirname, "dist/manifest.json"),
      publicPath: "/",
      generate: manifestGenerator,
    }),
    new runAfterDone()
  );
  config.optimization = config.optimization = {
    splitChunks: {
      chunks: "async",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
        },
      },
    },
    minimize: true,
    minimizer: [`...`, new CssMinimizerWebpackPlugin()],
  };
}

export default config;
