import React from "react";
import _ from "lodash";
import * as ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  makeStyles,
  createStyles,
  ThemeProvider,
  createMuiTheme,
  Theme,
} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/drawer";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import { rawProducts, isMenuExist, RawProduct, getMenuPage } from "./Pages";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, RouteChildrenProps, Redirect } from "react-router";
import PageRouter from "./PageRouter";
import GlobalContext from "./GlobalContext";

const theme = createMuiTheme();

interface AppParam {
  currentApp: string;
  currentPage: string;
}

function Page404() {
  React.useEffect(() => {
    document.title = "404 Not Found";
  });
  return <h1>404 Not Found</h1>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    body: {
      flexDirection: "row",
      flexWrap: "nowrap",
    },
    appMenu: {
      flexShrink: 0,
      width: 240,
    },
    content: {
      flexGrow: 1,
    },
    toolbar: theme.mixins.toolbar,
  }),
);

function Root({
  app,
  currentPage,
  page,
}: {
  app: RawProduct;
  currentPage: string;
  page?: string;
}) {
  const classes = useStyles({});
  return (
    <GlobalContext.Provider value={{ currentApp: app }}>
      <div className={classes.root}>
        <AppHeader currentApp={app.name} />
        <Drawer variant="permanent" className={classes.appMenu}>
          <div className={classes.toolbar}></div>
          <AppMenu app={app!} selected={currentPage} />
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar}></div>
          <PageRouter
            currentApp={app.name}
            currentPage={currentPage}
            pageId={page}
          />
        </div>
      </div>
    </GlobalContext.Provider>
  );
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Switch>
        <Route exact path="/:currentApp">
          {({ match }: RouteChildrenProps<AppParam>) => {
            const currentApp = match?.params.currentApp;
            const app = rawProducts.find(app => app.name === currentApp);
            if (app) {
              return <Redirect to={`/${app!.name}/${app!.defaultPage}`} />;
            }
            return <Page404 />;
          }}
        </Route>
        <Route path="/:currentApp/:currentPage">
          {({ match, location, history }: RouteChildrenProps<AppParam>) => {
            const { currentApp, currentPage } = match!.params;
            if (match!.isExact && !_.endsWith(location.pathname, "/")) {
              history.replace(
                `/${currentApp}/${currentPage}/${location.search}`,
              );
            }
            const app = rawProducts.find(app => app.name === currentApp);
            if (isMenuExist(currentPage, app?.menu ?? [])) {
              return (
                <Root
                  app={app!}
                  currentPage={currentPage}
                  page={getMenuPage(currentPage, app?.menu ?? [])}
                />
              );
            }
            return <Page404 />;
          }}
        </Route>
        <Route path="*">
          <Page404 />;
        </Route>
      </Switch>
    </Router>
  </ThemeProvider>,
  document.querySelector("#main"),
);
