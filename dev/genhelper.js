import Chance from "chance";
// Instantiate Chance so it can be used
export const chance = new Chance();
export const range = n => [...Array(n).keys()];

export const int = (min, max) => () => chance.integer({ min, max });
export const guidPool = () => {
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

export const words = n => () =>
  range(n)
    .map(() => chance.word())
    .join(" ");

export const repeat = (n, fn, sep = "") =>
  range(n)
    .map(fn)
    .join(sep);

export const keywords = words => {
  return words[int(0, words.length - 1)()];
};

