import * as React from "react";
import { createArticle } from "./Entity/Article";
import { ArticleComponent } from "./EditArticle";
import { useHistory } from "react-router";
import { DomainContext } from "./context";
import * as Query from "query-string";
import { goToPath, toPath } from "../../../framework/locationHelper";

export interface NewArticleProps {
  category: string;
}

export default (props: NewArticleProps) => {
  const { articleDomain } = React.useContext(DomainContext)!;
  const history = useHistory();
  const kbId = Query.parse(history.location.search).kbId as string;

  return (
    <ArticleComponent
      onSave={async article => {
        await articleDomain.addArticle(article);
        goToPath(history, toPath("."));
      }}
      article={createArticle("", kbId, props.category)}
      title="New Article"
    />
  );
};
