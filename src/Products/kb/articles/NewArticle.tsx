import * as React from "react";
import { createArticle } from "./Entity/Article";
import { ArticleComponent } from "./EditArticle";
import { useHistory } from "react-router";
import { newArticleDomain } from "./dependency";
import * as Query from "query-string";

export interface NewArticleProps extends React.Props<{}> {
  category: string;
}

export default (props: NewArticleProps) => {
  const { kbId } = Query.parse(location.search);
  const articleDomain = newArticleDomain(kbId as string);

  const history = useHistory();
  return (
    <ArticleComponent
      onSave={async article => {
        // dispatch({ type: ActionType.newArticle, payload: article });
        await articleDomain.addArticle(article);
        history.push(".");
      }}
      article={createArticle("", props.category)}
      title="New Article"
    />
  );
};
