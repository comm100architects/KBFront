export interface Article {
  id: string;
  status: ArticleStatus;
  featured: boolean;
  url: string;
  helpful: number;
  notHelpful: number;
  category: string;
  title: string;
  content: string;
  modifiedTime: Date;
  tags: string[];
}

export type ArticleStatus = "draft" | "published";

export const createArticle = (
  id: string,
  category: string,
  title: string = "",
  helpful: number = 0,
  notHelpful: number = 0,
  tags: string[] = [],
  status: ArticleStatus = "draft",
  featured: boolean = false,
): Article => {
  return {
    id: id,
    category: category,
    title: title,
    content: "<h1>New</h1>",
    url: `//ent.comm100.com/kb/1000007-25-a${id}?preview=true`,
    helpful: helpful,
    notHelpful: notHelpful,
    modifiedTime: new Date(),
    tags: tags,
    featured: featured,
    status: status,
  };
};

// get from server
// convert to ArticleCategory tree
export interface RawArticleCategory {
  id: string;
  label: string;
  parentCategory?: string;
  index: number;
}

const testRawCategories: RawArticleCategory[] = [
  { id: "1", label: "/", index: 0 },
  { id: "2", label: "test", parentCategory: "1", index: 0 },
  { id: "3", label: "test2", parentCategory: "1", index: 1 },
  { id: "4", label: "subtest", parentCategory: "2", index: 0 },
  { id: "5", label: "subtest2", parentCategory: "2", index: 1 },
];

const makeCategoryTree = (
  categories: RawArticleCategory[],
  currentCategory: RawArticleCategory,
): ArticleCategory => ({
  id: currentCategory.id,
  label: currentCategory.label,
  children: categories
    .filter(c => c.parentCategory === currentCategory.id)
    .sort((a, b) => a.index - b.index)
    .map(c => makeCategoryTree(categories, c)),
});

const findRootCategory = (
  categories: RawArticleCategory[],
): RawArticleCategory => categories.find(c => !Boolean(c.parentCategory))!;

export interface ArticleCategory {
  id: string;
  label: string;
  children: ArticleCategory[];
}

export const testCategories: ArticleCategory = makeCategoryTree(
  testRawCategories,
  findRootCategory(testRawCategories),
);

export interface DisplayCategory {
  id: string;
  path: string;
}

export const displayCategories = ({
  id,
  label,
  children,
}: ArticleCategory): DisplayCategory[] => {
  const sep = label === "/" ? "" : "/";
  const result = children
    .map(child => displayCategories(child))
    .reduce((res, list) => res.concat(list), [])
    .map(c => ({ id: c.id, path: label + sep + c.path }));
  result.unshift({ id: id, path: label });
  return result;
};

console.log(displayCategories(testCategories));

export const testArticles: Article[] = [
  createArticle("305", "1", "Cupcake", 67, 43, ["Live Chat", "Ticket"]),
  createArticle("452", "2", "Donut", 51, 49, ["Live Chat"]),
  createArticle("262", "3", "Eclair", 24, 60, ["Live Chat"], "published", true),
  createArticle("159", "4", "Frozen yoghurt", 24, 40, ["Live Chat"]),
  createArticle("356", "5", "Gbrea", 49, 39, ["Live Chat"], "published", false),
  createArticle("408", "1", "Honeycomb", 87, 65, ["Live Chat"]),
  createArticle("237", "2", "Ice cream sandwich", 37, 43, ["Live Chat"]),
  createArticle("375", "3", "Jelly Bean", 94, 0, ["Live Chat"]),
  createArticle("518", "4", "KitKat", 65, 70, ["Live Chat"]),
  createArticle("392", "5", "Lollipop", 98, 0, ["Live Chat"]),
  createArticle("318", "1", "Marshmallow", 81, 20, ["Live Chat"]),
  createArticle("360", "2", "Nougat", 9, 370, ["Live Chat"]),
  createArticle("437", "3", "Oreo", 63, 40, ["Live Chat"]),
];

export const testTags: string[] = ["Live Chat", "Ticket"];
