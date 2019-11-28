import * as React from "react";
import { createArticle } from "./State";
import EditArticle from "./EditArticle";

export interface NewArticleProps extends React.Props<{}> {
  category: string;
}

export default (props: NewArticleProps) => (
  <EditArticle state={createArticle("0", props.category)} title="New Article" />
);
