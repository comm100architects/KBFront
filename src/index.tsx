import * as React from "react";
import * as ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  makeStyles,
  createStyles,
  ThemeProvider,
  createMuiTheme,
  Theme
} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/drawer";
import AppHeader from "./AppHeader";
import AppMenu from "./AppMenu";
import { rawApps, isMenuExist, getMenuLabel, RawApp } from "./Pages";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, RouteChildrenProps, Redirect } from "react-router";
import PageRouter from "./PageRouter";
import DocumentTitle from "react-document-title";
import GlobalContext from "./GlobalContext";

const theme = createMuiTheme();

interface AppParam {
  currentApp: string;
  currentPage: string;
}

function Page404() {
  return (
    <DocumentTitle title="404 Not Found">
      <h1>404 Not Found</h1>
    </DocumentTitle>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex"
    },
    body: {
      flexDirection: "row",
      flexWrap: "nowrap"
    },
    appMenu: {
      flexShrink: 0,
      width: 240
    },
    content: {
      flexGrow: 1
    },
    toolbar: theme.mixins.toolbar
  })
);

function Root({ app, currentPage }: { app: RawApp; currentPage: string }) {
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
          <PageRouter currentApp={app.name} currentPage={currentPage} />
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
            const app = rawApps.find(app => app.name === currentApp);
            if (app) {
              return <Redirect to={`/${app!.name}/${app!.defaultPage}`} />;
            }
            return <Page404 />;
          }}
        </Route>
        <Route exact strict path="/:currentApp/:currentPage">
          {({ match }: RouteChildrenProps<AppParam>) => {
            const { currentApp, currentPage } = match!.params;
            return <Redirect to={`/${currentApp}/${currentPage}/`} />;
          }}
        </Route>
        <Route path="/:currentApp/:currentPage">
          {({ match }: RouteChildrenProps<AppParam>) => {
            const { currentApp, currentPage } = match!.params;
            const app = rawApps.find(app => app.name === currentApp);
            if (isMenuExist(currentPage, app?.menu ?? [])) {
              return <Root app={app!} currentPage={currentPage} />;
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
  document.querySelector("#main")
);
