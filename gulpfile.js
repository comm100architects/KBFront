const gulp = require("gulp");
const spawn = require("child_process").spawn;

function log(s) {
  console.log(`[${new Date()}]: ${s}`);
}

function exec(cmd) {
  log(cmd);
  return new Promise(function(resolve, reject) {
    const parts = cmd.split(" ");
    const child = spawn(parts[0], parts.slice(1), {
      stdio: "inherit",
    });
    child.on("close", code => {
      return code === 0 ? resolve() : reject(code);
    });
  });
}

gulp.task("default", function() {
  exec("node dev/server.js");
  exec("npm run mock");
  exec("npm run js");
});
