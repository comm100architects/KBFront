import * as React from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router";
import Articles from "./Articles";
import NewArticle from "./NewArticle";
import EditArticle from "./EditArticle";
import { testArticles } from "./State";
import { parse } from "query-string";

export default () => {
  const match = useRouteMatch();
  const location = useLocation();
  const { id } = parse(location.search);
  const article = testArticles.find(article => article.id === id);
  return (
    <Switch>
      <Route exact path={`${match.url}/`}>
        <Articles />
      </Route>
      <Route exact path={`${match.url}/new`}>
        <NewArticle category="1" />
      </Route>
      <Route exact path={`${match.url}/edit`}>
        <EditArticle state={article!} />
      </Route>
    </Switch>
  );
};
