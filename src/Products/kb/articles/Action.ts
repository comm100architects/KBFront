import { Article, RawArticleCategory } from "./Model";

export enum ActionType {
  newArticle = "newArticle",
  editArticle = "editArticle",
  deleteArticle = "deleteArticle",
  editArticleCategory = "editArticleCategory",
  newArticleCategory = "newArticleCategory",
  deleteArticleCategory = "deleteArticleCategory",
}

export type NewArticleAction = {
  type: ActionType;
  payload: Article;
};

export type EditArticleAction = {
  type: ActionType;
  payload: Article;
};

export type DeleteArticle = {
  type: ActionType;
  payload: string;
};

export type NewArticleCategory = {
  type: ActionType;
  payload: RawArticleCategory;
};

export type EditArticleCategory = {
  type: ActionType;
  payload: RawArticleCategory;
};

export type DeleteArticleCategory = {
  type: ActionType;
  payload: string;
};

export type Action = NewArticleAction | EditArticleAction;
