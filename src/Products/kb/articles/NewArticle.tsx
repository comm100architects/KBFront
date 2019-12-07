import * as React from "react";
import { createArticle, Article } from "./Model";
import EditArticle from "./EditArticle";

export interface NewArticleProps extends React.Props<{}> {
  category: string;
  onSave(article: Article): void;
}

export default (props: NewArticleProps) => (
  <EditArticle
    onSave={props.onSave}
    state={createArticle("", props.category)}
    title="New Article"
  />
);
