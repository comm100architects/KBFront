const fs = require("fs");
const { chance, repeat, int, keywords } = require("./genhelper");

const parseCssModeKeywords = name =>
  new RegExp(`var ${name}[^=]*?=[^]]*?\\[((.|\n)*?)\\]`, "m")
    .exec(
      fs.readFileSync("./node_modules/codemirror/mode/css/css.js", {
        encoding: "utf-8",
      }),
    )[1]
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s)
    .map(s => s.substr(1, s.length - 1));

const cssProperties = parseCssModeKeywords("propertyKeywords_");
const cssValues = parseCssModeKeywords("valueKeywords_");

module.exports = () =>
  repeat(
    20,
    () => {
      const selector = repeat(
        int(1, 3)(),
        () => `${keywords("#.")}${chance.word()}`,
        keywords([" > ", " "]),
      );
      const styles = repeat(
        int(1, 5)(),
        () => `  ${keywords(cssProperties)}: ${keywords(cssValues)}\n`,
      );
      return `${selector} \{\n${styles}\}`;
    },
    "\n",
  );