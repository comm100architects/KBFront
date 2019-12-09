const http = require("http");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 9000;

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {
  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  if (
    req.url.indexOf("/dist") !== -1 ||
    req.url.indexOf("/node_modules") !== -1
  ) {
    if (req.url.indexOf("page") !== -1) {
      setTimeout(() => writeFile(`./${req.url}`, res), 1000);
    } else {
      writeFile(`./${req.url}`, res);
    }
    return;
  }

  if (req.url.indexOf("favicon") !== -1) {
    writeFile("./favicon.ico", res);
    return;
  }

  res.setHeader("Content-Type", "text/html");
  writeFile("./index.html", res);
});

function writeFile(filename, res) {
  if (fs.existsSync(filename)) {
    res.end(fs.readFileSync(filename));
    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
}

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
