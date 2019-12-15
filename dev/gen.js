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

const articleStatus = int(0, 1);
const words = n => () =>
  range(n)
    .map(() => chance.word())
    .join(" ");

const generate = sc => {
  if (Array.isArray(sc)) {
    const [count, subsc] = sc;
    return range(count).map(() => generate(subsc));
  }

  if (typeof sc === "function") {
    return sc.call(chance);
  }

  const obj = {};
  for (const key of Object.keys(sc)) {
    obj[key] = generate(sc[key]);
  }
  return obj;
};

const genTree = (parentIdName, sc, childrenCount, parent, depth) => {
  if (depth === 0) return [parent];
  const children = range(childrenCount)
    .map(() =>
      genTree(
        parentIdName,
        sc,
        childrenCount,
        { ...generate(sc), [parentIdName]: parent.id },
        depth - 1,
      ),
    )
    .reduce((a, b) => a.concat(b), []);
  return [parent, ...children];
};

const data = range(10)
  .map(() =>
    generate({
      id: chance.guid,
      name: words(3),
      allowFeedback: chance.bool,
      visibility: () => (chance.bool() ? "private" : "public"),
      status: () => (chance.bool() ? "close" : "open"),
    }),
  )
  .reduce(
    (result, kb) => {
      const [categoryId, referenceCategoryId] = guidPool();
      result.knowledgeBases.push(kb);
      result.categories = result.categories.concat(
        genTree(
          "parentCategoryId",
          {
            id: categoryId,
            kbId: () => kb.id,
            title: words(2),
            index: int(2, 1000),
          },
          3,
          {
            id: categoryId(),
            kbId: kb.id,
            title: "/",
            parentCategoryId: "",
            index: 0,
          },
          2,
        ),
      );
      result.articles = result.articles.concat(
        generate([
          50,
          {
            id: chance.guid,
            kbId: () => kb.id,
            categoryId: referenceCategoryId,
            title: chance.sentence,
            content: chance.paragraph,
            url: chance.url,
            helpful: int(20, 50),
            notHelpful: int(20, 50),
            modifiedTime: chance.date,
            tags: [3, chance.word],
            featured: chance.bool,
            status: articleStatus,
          },
        ]),
      );
      return result;
    },
    { knowledgeBases: [], categories: [], articles: [] },
  );

console.log(JSON.stringify(data, null, 2));
