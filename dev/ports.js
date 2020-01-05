import os from "os";

const user = os.userInfo().username;
const ports = {
  chendesheng: 9000,
  roy: 9001,
};
export const port = ports[user] || 9000;
