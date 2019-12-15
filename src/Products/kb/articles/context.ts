import * as React from "react";
import { ArticleDomain } from "./Domain/ArticleDomain";
import { CategoryDomain } from "./Domain/CategoryDomain";
import { RESTfulRepository } from "../../../framework/repository";
import { Article } from "./Entity/Article";
import { Category } from "./Entity/Category";
import { Entity } from "./Entity/Spec";

export interface Domains {
  articleDomain: ArticleDomain;
  categoryDomain: CategoryDomain;
}
export const DomainContext = React.createContext(
  undefined as Domains | undefined,
);

const host = "//localhost:3000";

const newArticleDomain = () => {
  const repo = new RESTfulRepository<Article>(host, `articles`);
  return new ArticleDomain(repo);
};

const newCategoryDomain = () => {
  const repo = new RESTfulRepository<Category>(host, `categories`);
  return new CategoryDomain(repo);
};

export const createDomains = () => ({
  entitiesDomain: new RESTfulRepository<Entity[]>("", "entities"),
  articleDomain: newArticleDomain(),
  categoryDomain: newCategoryDomain(),
});
