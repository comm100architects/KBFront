import Bundler from "parcel-bundler";

import path from "path";
import { port } from "./ports";
import jsonServer from "json-server";

import chokidar from "chokidar";
import dynamicMiddleware from "express-dynamic-middleware";

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

  const dynamicJsonServer = dynamicMiddleware.create();
  app.use("/api", dynamicJsonServer.handle());

  const loadDb = p => {
    dynamicJsonServer.clean();
    dynamicJsonServer.use(jsonServer.router(p));
  };

  const dbPath = _p("./db.json");
  loadDb(dbPath);

  chokidar.watch([dbPath]).on("change", p => {
    console.log(`${path} changed, reload db`);
    loadDb(p);
  });

  app.get("/favicon.ico", serveFile("../favicon.ico"));
  app.get("/globalSettings", serveFile("./settings.json"));

  const bundler = new Bundler(_p("../src/index.html"), {});
  app.use(bundler.middleware());
};

console.log(`Server running at http://localhost:${port}/`);

const server = jsonServer.create();
installMiddlewares(server);

server.listen(port, "0.0.0.0", function(err) {
  if (err) {
    console.log(err);
  }
});
