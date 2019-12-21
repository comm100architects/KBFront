const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  removeDataTestIdTransformer,
} = require("typescript-transformer-jsx-remove-data-test-id");

module.exports = {
  mode: "development",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  entry: "./src/index.tsx",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.[contenthash].js",
    chunkFilename: "[name].chunk.[contenthash].js",
    publicPath: "/dist/",
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              getCustomTransformers: () => ({
                before: [removeDataTestIdTransformer()],
              }),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/index.html"),
      filename: "../index.html", //relative to root of the application
    }),
  ],
};
