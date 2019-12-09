import { ArticleDomain } from "./Domain/ArticleDomain";
import { CategoryDomain } from "./Domain/CategoryDomain";
import { ArticleRepository } from "./Repository/ArticleRepository";
import { CategoryRepository } from "./Repository/CategoryRepository";
import { RESTfulRepository } from "../../../framework/repository";

const baseUrl = "//localhost:3000";

export const newArticleDomain = (kbId: string) => {
  const repo = new ArticleRepository(`${baseUrl}/kb/${kbId}/articles`);
  return new ArticleDomain(repo);
};
export const newCategoryDomain = (kbId: string) => {
  const repo = new CategoryRepository(`${baseUrl}/kb/${kbId}/categories`);
  return new CategoryDomain(repo);
};
