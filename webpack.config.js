const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  removeDataTestIdTransformer,
} = require("typescript-transformer-jsx-remove-data-test-id");

module.exports = {
  cache: false,
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
        exclude: /node_modules|__test__/,
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
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
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
