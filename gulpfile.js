const gulp = require("gulp");
const spawn = require("child_process").spawn;

function log(s) {
  console.log(`[${new Date()}]: ${s}`);
}

const execCmd = cmd => {
  log(cmd);
  const parts = cmd.split(" ");
  let preCmd = parts[0];
  if (process.platform === "win32") {
    preCmd = preCmd === "npm" ? "npm.cmd" : preCmd;
  }
  return spawn(preCmd, parts.slice(1), {
    stdio: "inherit",
  });
};

function exec(cmd) {
  return new Promise(function(resolve, reject) {
    const child = execCmd(cmd);
    child.on("close", code => {
      return code === 0 ? resolve() : reject(code);
    });
  });
}

const watchedProcesses = {};
setInterval(() => {
  for (const cmd of Object.keys(watchedProcesses)) {
    const p = watchedProcesses[cmd];
    if (p.status === "changed") {
      p.process = execCmd(cmd);
      p.process.on("close", code => {
        if (code === null) {
          // set to changed when kill by watch
          p.status = "changed";
        } else {
          p.status = "done";
        }
      });
      p.status = "running";
    }
  }
}, 10);

const watch = (globs, cmd, doNotRunAtStart) => {
  watchedProcesses[cmd] = {
    status: doNotRunAtStart ? "done" : "changed",
    process: null,
  };

  gulp.watch(globs, {}, function(done) {
    log(`${globs} changed`);

    const p = watchedProcesses[cmd];
    if (p.status === "running") {
      watchedProcesses[cmd].process.kill();
    } else if (p.status === "done") {
      watchedProcesses[cmd].status = "changed";
    }
    done();
  });
};

gulp.task("default", () => {
  exec("npm run mock");
  watch(["webpack.config.js"], "npm run js:watch");
  watch(
    ["dev/gen*.js", "dev/entities/*.json", "dev/pages/*.json"],
    "npm run gen",
    true,
  );
  watch(["dev/server.js"], "npm run server");
});
