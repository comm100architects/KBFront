import * as React from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import Articles from "./Articles";
import NewArticle from "./NewArticle";
import EditArticle from "./EditArticle";
import { createArticle } from "./State";

export default () => {
  const match = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${match.url}/`}>
        <Articles />
      </Route>
      <Route exact path={`${match.url}/new`}>
        <NewArticle id="0" category="1" />
      </Route>
      <Route exact path={`${match.url}/edit`}>
        <EditArticle state={createArticle("articleid", "1")} />
      </Route>
    </Switch>
  );
};
