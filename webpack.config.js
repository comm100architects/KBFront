const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  entry: "./src/index.tsx",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.[contenthash].js",
    chunkFilename: "[name].chunk.[contenthash].js",
    publicPath: "/dist/"
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [{ loader: "ts-loader" }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/index.html"),
      filename: "../index.html" //relative to root of the application
    })
  ]
};
