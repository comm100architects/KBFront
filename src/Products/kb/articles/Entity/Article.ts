export enum ArticleStatus {
  draft = 0,
  published = 1,
}

export type Article = {
  id: string;
  status: ArticleStatus;
  featured: boolean;
  url: string;
  helpful: number;
  notHelpful: number;
  categoryId: string;
  title: string;
  content: string;
  modifiedTime: Date;
  tags: string[];
};

export const createArticle = (
  id: string,
  categoryId: string,
  title: string = "",
  helpful: number = 0,
  notHelpful: number = 0,
  tags: string[] = [],
  status: ArticleStatus = ArticleStatus.draft,
  featured: boolean = false,
): Article => {
  return {
    id,
    categoryId,
    title,
    content: "<h1>New</h1>",
    url: id,
    helpful,
    notHelpful,
    modifiedTime: new Date(),
    tags,
    featured,
    status,
  };
};

