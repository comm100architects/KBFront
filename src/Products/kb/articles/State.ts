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

export interface ArticleCategory {
  id: string;
  label: string;
  parentCategory?: string;
}

export const testCategories: ArticleCategory[] = [
  { id: "1", label: "/" },
  { id: "2", label: "test" },
];

export const testArticles: Article[] = [
  createArticle("305", "/", "Cupcake", 67, 43, ["Live Chat", "Ticket"]),
  createArticle("452", "/", "Donut", 51, 49, ["Live Chat"]),
  createArticle("262", "/", "Eclair", 24, 60, ["Live Chat"], "published", true),
  createArticle("159", "test", "Frozen yoghurt", 24, 40, ["Live Chat"]),
  createArticle("356", "/", "Gbrea", 49, 39, ["Live Chat"], "published", false),
  createArticle("408", "/", "Honeycomb", 87, 65, ["Live Chat"]),
  createArticle("237", "/", "Ice cream sandwich", 37, 43, ["Live Chat"]),
  createArticle("375", "test", "Jelly Bean", 94, 0, ["Live Chat"]),
  createArticle("518", "test", "KitKat", 65, 70, ["Live Chat"]),
  createArticle("392", "test", "Lollipop", 98, 0, ["Live Chat"]),
  createArticle("318", "/", "Marshmallow", 81, 20, ["Live Chat"]),
  createArticle("360", "/", "Nougat", 9, 370, ["Live Chat"]),
  createArticle("437", "/", "Oreo", 63, 40, ["Live Chat"]),
];

export const testTags: string[] = ["Live Chat", "Ticket"];
