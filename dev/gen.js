import path from "path";
import css from "./gencss";
import html from "./genhtml";
import { int, guidPool, words, range, chance, keywords } from "./genhelper";
import menu from "./genmenu";
import _ from "lodash/fp";
const fs = require("fs");
const _p = s => path.join(__dirname, s);
import { genIcons } from "./genicon";

const generate = sc => {
  if (Array.isArray(sc)) {
    const [count, subsc] = sc;
    return range(count).map(() => generate(subsc));
  }

  if (typeof sc === "function") {
    return sc.call(chance);
  }

  if (
    _.isString(sc) ||
    _.isNumber(sc) ||
    _.isBoolean(sc) ||
    _.isDate(sc) ||
    _.isNull(sc)
  ) {
    return sc;
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

const entities = fs
  .readdirSync(_p("./entities"))
  .filter(name => /\.json$/.test(name))
  .map(name =>
    JSON.parse(
      fs.readFileSync(_p(`./entities/${name}`), { encoding: "utf-8" }),
    ),
  )
  .map(entity => Object.assign(entity, { id: entity.name }));

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

      const tags = generate([
        10,
        {
          id: chance.guid,
          name: words(3),
          kbId: () => kb.id,
        },
      ]);

      const articles = generate([
        int(10, 50)(),
        {
          id: chance.guid,
          kbId: () => kb.id,
          categoryId: referenceCategoryId,
          title: chance.sentence,
          body: html,
          url: chance.url,
          numOfHelpful: int(20, 50),
          numOfNotHelpful: int(20, 50),
          modifiedTime: chance.date,
          tagIds: [3, () => keywords(tags.map(t => t.id))],
          featured: chance.bool,
          status: int(0, 1),
        },
      ]);

      const [customPageId, referenceCustomPageId] = guidPool();
      const customPages = generate([
        int(1, 10)(),
        {
          id: customPageId,
          title: words(3),
          modified: chance.date,
          status: int(0, 1),
          kbId: () => kb.id,
          body: html,
        },
      ]);

      const designs = [
        generate({
          id: chance.guid,
          title: "CSS File",
          body: css,
          modifiedTime: chance.date,
          status: int(0, 1),
          kbId: () => kb.id,
        }),
      ].concat(
        [
          "Category Page",
          "Article Page",
          "Search Result Page",
          "404 Page (Page Not Found)",
        ].map(title =>
          generate({
            id: chance.guid,
            title,
            body: html,
            modifiedTime: chance.date,
            status: int(0, 1),
            kbId: () => kb.id,
          }),
        ),
      );

      result.articles = result.articles.concat(articles);
      result.customPages = result.customPages.concat(customPages);
      result.designs = result.designs.concat(designs);
      result.tags = result.tags.concat(tags);
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
      entities,
      menu: menu(),
      tags: [],
      icons: genIcons(),
    },
  );

console.log(JSON.stringify(data, null, 2));
