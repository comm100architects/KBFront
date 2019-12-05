import * as React from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router";
import AllArticles from "./Articles";
import NewArticle from "./NewArticle";
import EditArticle from "./EditArticle";
import { dictArticles, Article, Articles, rootCategory } from "./Model";
import { parse } from "query-string";
import { useHistory } from "react-router";
import { ActionType } from "./Action";
import reducer from "./Reducer";

const getArticle = (articles: Articles, search: string): Article => {
  const { id } = parse(search);
  return articles[id as string]!;
};

export default () => {
  const match = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const [articles, dispatch] = React.useReducer(reducer, dictArticles);

  return (
    <Switch>
      <Route exact path={`${match.url}/`}>
        <AllArticles
          articles={Object.values(articles)}
          category={rootCategory}
        />
      </Route>
      <Route exact path={`${match.url}/new`}>
        <NewArticle
          onSave={article => {
            dispatch({ type: ActionType.newArticle, payload: article });
            history.push(".");
          }}
          category="1"
        />
      </Route>
      <Route exact path={`${match.url}/edit`}>
        <EditArticle
          onSave={article => {
            dispatch({ type: ActionType.editArticle, payload: article });
            history.push(".");
          }}
          state={getArticle(articles, location.search)}
        />
      </Route>
    </Switch>
  );
};
