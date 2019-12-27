const Chance = require("chance");
const chance = new Chance();
const fs = require("fs");
const { repeat, int, keywords } = require("./genhelper");

const parseStringArray = s =>
  s
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s)
    .map(s => s.substr(1, s.length - 1));

const cssProperties = parseStringArray(
  /var propertyKeywords_[^=]*?=[^]]*?\[((.|\n)*?)\]/m.exec(
    fs.readFileSync("./node_modules/codemirror/mode/css/css.js", {
      encoding: "utf-8",
    }),
  )[1],
);

const cssValues = parseStringArray(
  /var valueKeywords_[^=]*?=[^]]*?\[((.|\n)*?)\]/m.exec(
    fs.readFileSync("./node_modules/codemirror/mode/css/css.js", {
      encoding: "utf-8",
    }),
  )[1],
);

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
        () => `\t${keywords(cssProperties)}: ${keywords(cssValues)}\n`,
      );
      return `${selector} \{\n${styles}\}`;
    },
    "\n",
  );
