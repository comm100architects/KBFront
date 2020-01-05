import os from "os";

const ports = {
  chendesheng: 9000,
  roy: 9001,
};

export const port = ports[os.userInfo().username] || 9000;
