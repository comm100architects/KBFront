import path from "path";
import { port } from "./ports";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import jsonServer from "json-server";
import genDb from "./gen";
import config from "./webpack.config";

const _p = s => path.join(__dirname, s);
const serveFile = s => (_, res) => res.sendFile(_p(s));

const installMiddlewares = app => {
  app.use(
    jsonServer.rewriter({
      "/api/articles?kbId=:kbId&keyword=:keyword":
        "/api/articles?kbId=:kbId&q=:keyword",
      "/api/customPages?kbId=:kbId&keyword=:keyword":
        "/api/customPages?kbId=:kbId&q=:keyword",
    }),
  );

  app.use("/api", jsonServer.router(genDb()));
  app.get("/favicon.ico", serveFile("../favicon.ico"));
  app.get("/globalSettings", serveFile("./settings.json"));
};

const server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  before: installMiddlewares,
  stats: {
    colors: true,
  },
});

server.listen(port, "localhost", function(err) {
  if (err) {
    console.log(err);
  }
  console.log(`Server running at http://localhost:${port}/`);
});
