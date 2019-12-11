import * as React from "react";
import { ArticleDomain } from "./Domain/ArticleDomain";
import { CategoryDomain } from "./Domain/CategoryDomain";
import { RESTfulRepository } from "../../../framework/repository";

export interface Domains {
  articleDomain: ArticleDomain;
  categoryDomain: CategoryDomain;
}
export const DomainContext = React.createContext(
  undefined as Domains | undefined,
);

const host = "localhost:3000";

const newArticleDomain = (kbId: string) => {
  const repo = new RESTfulRepository<Article>(host, `/kb/${kbId}/articles`);
  return new ArticleDomain(repo);
};

const newCategoryDomain = (kbId: string) => {
  const repo = new RESTfulRepository<Category>(host, `/kb/${kbId}/categories`);
  return new CategoryDomain(repo);
};

export const createDomains = (kbId: string) => ({
  articleDomain: newArticleDomain(kbId),
  categoryDomain: newCategoryDomain(kbId),
});
