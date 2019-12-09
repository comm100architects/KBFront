import * as React from "react";
import { ArticleDomain } from "./Domain/ArticleDomain";
import { CategoryDomain } from "./Domain/CategoryDomain";

export interface Domains {
  articleDomain: ArticleDomain;
  categoryDomain: CategoryDomain;
}
export const DomainContext = React.createContext(
  undefined as Domains | undefined,
);
