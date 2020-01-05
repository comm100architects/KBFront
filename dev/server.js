import jsonServer from "json-server";
import path from "path";
import express from "express";
import { existsSync, readFileSync } from "fs";
import { port } from "./ports";

const serveFile = s => (_, res) => {
  res.sendFile(path.join(__dirname, s));
};

const server = jsonServer.create();

server.get("/", serveFile("../index.html"));
server.get("/favicon.ico", serveFile("../favicon.ico"));
server.get("/globalSettings", serveFile("./settings.json"));
server.use("/dist", express.static(path.join(__dirname, "../dist")));
server.use(jsonServer.defaults());
server.use(
  jsonServer.rewriter({
    "/api/articles?kbId=:kbId&keyword=:keyword":
      "/api/articles?kbId=:kbId&q=:keyword",
    "/api/customPages?kbId=:kbId&keyword=:keyword":
      "/api/customPages?kbId=:kbId&q=:keyword",
  }),
);
server.use("/api", jsonServer.router("dist/db.json"));
server.get("/*", serveFile("../index.html"));

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
