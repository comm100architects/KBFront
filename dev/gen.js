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

const repeat = (n, fn) =>
  range(n)
    .map(fn)
    .join("");

const html = () =>
  `<h1>${words(3)()}</h1>` +
  repeat(3, () => `<h3>${chance.sentence()}</h3><p>${chance.paragraph()}</p>`);

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
      visibility: () => (chance.bool() ? 0 : 1),
      status: () => (chance.bool() ? 0 : 1),
      homePageType: () => (chance.bool() ? 0 : 1),
      numOfArticles: () => 0,
      numOfImages: int(0, 100),
      numOfCustomPages: () => 0,
    }),
  )
  .reduce(
    (result, kb) => {
      const [categoryId, referenceCategoryId] = guidPool();
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
      const articles = generate([
        int(10, 50)(),
        {
          id: chance.guid,
          kbId: () => kb.id,
          categoryId: referenceCategoryId,
          title: chance.sentence,
          content: html,
          url: chance.url,
          helpful: int(20, 50),
          notHelpful: int(20, 50),
          modifiedTime: chance.date,
          tags: [3, chance.word],
          featured: chance.bool,
          status: articleStatus,
        },
      ]);

      const [customPageId, referenceCustomPageId] = guidPool();
      const customPages = generate([
        int(1, 10)(),
        {
          id: customPageId,
          title: chance.sentence,
          modified: chance.date,
          status: articleStatus,
          kbId: () => kb.id,
        },
      ]);

      const designs = generate([
        int(1, 10)(),
        {
          id: chance.guid,
          title: words(2),
          body: html,
          modifiedTime: chance.date,
          status: articleStatus,
          kbId: () => kb.id,
        },
      ]);

      result.articles = result.articles.concat(articles);
      result.customPages = result.customPages.concat(customPages);
      result.designs = result.designs.concat(designs);
      kb.numOfArticles = articles.length;
      kb.numOfCustomPages = customPages.length;
      kb.homeCustomPageId = referenceCustomPageId();
      result.knowledgeBases.push(kb);
      return result;
    },
    {
      knowledgeBases: [],
      categories: [],
      articles: [],
      customPages: [],
      designs: [],
    },
  );

console.log(JSON.stringify(data, null, 2));
