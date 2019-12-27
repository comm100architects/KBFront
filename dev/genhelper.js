const Chance = require("chance");
// Instantiate Chance so it can be used
const chance = new Chance();
const range = n => [...Array(n).keys()];

const int = (min, max) => () => chance.integer({ min, max });
const guidPool = () => {
  const pool = [];
  return [
    function() {
      const guid = chance.guid();
      pool.push(guid);
      return guid;
    },
    function() {
      return pool[int(0, pool.length - 1)()];
    },
    function() {
      return pool;
    },
  ];
};

const words = n => () =>
  range(n)
    .map(() => chance.word())
    .join(" ");

const repeat = (n, fn, sep = "") =>
  range(n)
    .map(fn)
    .join(sep);

const keywords = words => {
  return words[int(0, words.length - 1)()];
};

module.exports = { int, guidPool, words, repeat, keywords };
