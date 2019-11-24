import * as React from "react";
import { createArticle } from "./State";
import EditArticle from "./EditArticle";

export interface NewArticleProps extends React.Props<{}> {
  id: string;
  category: string;
}

export default (props: NewArticleProps) => (
  <EditArticle
    state={createArticle(props.id, props.category)}
    title="New Article"
  />
);
