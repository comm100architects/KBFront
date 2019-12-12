import * as React from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import AllArticles from "./Articles";
import NewArticle from "./NewArticle";
import { EditArticle } from "./EditArticle";
import { KbSelect } from "./KbSelect";
import { DomainContext, createDomains } from "./context";

const ArticlePage = ({ children }: { children: JSX.Element }) => {
  const [domains] = React.useState(() => createDomains());
  return (
    <div style={{ position: "relative" }}>
      <KbSelect />
      <DomainContext.Provider value={domains}>
        {domains && children}
      </DomainContext.Provider>
    </div>
  );
};

export default () => {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${match.url}/`}>
        <ArticlePage>
          <AllArticles />
        </ArticlePage>
      </Route>
      <Route exact path={`${match.url}/new`}>
        <ArticlePage>
          <NewArticle category="1" />
        </ArticlePage>
      </Route>
      <Route exact path={`${match.url}/edit`}>
        <ArticlePage>
          <EditArticle />
        </ArticlePage>
      </Route>
    </Switch>
  );
};
