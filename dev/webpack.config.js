import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { removeDataTestIdTransformer } from "typescript-transformer-jsx-remove-data-test-id";

export default {
  mode: "development",
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  entry: "./src/index.tsx",
  output: {
    filename: "[name].bundle.[hash].js",
    chunkFilename: "[name].chunk.[hash].js",
    publicPath: "/",
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
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
      template: path.join(__dirname, "../src/index.html"),
    }),
  ],
};
