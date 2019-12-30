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
import { isMenuExist, RawProduct, getMenuPages } from "./Pages";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, RouteChildrenProps, Redirect } from "react-router";
import PageRouter from "./PageRouter";
import GlobalContext from "./GlobalContext";
import { fetchJson } from "./framework/network";
import { GlobalSettings } from "./components/DSL/types";

const theme = createMuiTheme();

interface AppParam {
  currentProduct: string;
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
  pageId,
  relatviePath,
  globalSettings,
}: {
  app: RawProduct;
  currentPage: string;
  pageId?: string;
  relatviePath: string;
  globalSettings: GlobalSettings;
}) {
  const classes = useStyles({});
  return (
    <GlobalContext.Provider value={{ currentProduct: app }}>
      <div className={classes.root}>
        <AppHeader currentProduct={app.name} menu={globalSettings.menu} />
        <Drawer variant="permanent" className={classes.appMenu}>
          <div className={classes.toolbar}></div>
          <AppMenu app={app!} selected={currentPage} />
        </Drawer>
        <div className={classes.content}>
          <div className={classes.toolbar}></div>
          <PageRouter
            currentProduct={app.name}
            currentPage={currentPage}
            pageId={pageId}
            relatviePath={relatviePath}
            globalSettings={globalSettings}
          />
        </div>
      </div>
    </GlobalContext.Provider>
  );
}

const getGlobalSettings = async () => {
  const res = (await fetchJson("/globalSettings", "GET")) as GlobalSettings;
  const menu = (await fetchJson(
    `//${res.endPointPrefix}/menu`,
    "GET",
  )) as RawProduct[];
  res.menu = menu;
  return res;
};

getGlobalSettings()
  .then((globalSettings: GlobalSettings) => {
    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Switch>
            <Route exact path="/:currentProduct">
              {({ match }: RouteChildrenProps<AppParam>) => {
                const currentProduct = match?.params.currentProduct;
                const app = globalSettings.menu.find(
                  app => app.name === currentProduct,
                );
                if (app) {
                  return <Redirect to={`/${app!.name}/${app!.defaultPage}`} />;
                }
                return <Page404 />;
              }}
            </Route>
            <Route path="/:currentProduct/:currentPage">
              {({ match, location, history }: RouteChildrenProps<AppParam>) => {
                const { currentProduct, currentPage } = match!.params;
                if (match!.isExact && !_.endsWith(location.pathname, "/")) {
                  history.replace(
                    `/${currentProduct}/${currentPage}/${location.search}`,
                  );
                }
                const app = globalSettings.menu.find(
                  app => app.name === currentProduct,
                );
                if (isMenuExist(currentPage, app?.menu ?? [])) {
                  const relatviePath = location.pathname.substring(
                    `/${currentProduct}/${currentPage}/`.length,
                  );
                  console.log(`relatviePath: ${relatviePath}`);
                  const pageId = getMenuPages(
                    currentPage,
                    app?.menu ?? [],
                  ).find(pageRef => pageRef.relatviePath === relatviePath)
                    ?.pageId;
                  return (
                    <Root
                      app={app!}
                      currentPage={currentPage}
                      pageId={pageId}
                      relatviePath={relatviePath}
                      globalSettings={globalSettings}
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
  })
  .catch(() => {
    ReactDOM.render(<h4>Ooops...</h4>, document.querySelector("#main"));
  });
