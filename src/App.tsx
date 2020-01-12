import React from "react";
import _ from "lodash";
import { getGlobalSettings } from "./GlobalContext";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  makeStyles,
  createStyles,
  ThemeProvider,
  createMuiTheme,
  Theme,
} from "@material-ui/core/styles";
import { Header } from "./Header";
import { Menu } from "./Menu";
import { TopMenu, GlobalSettings, findMenu, UIAction } from "./gen/types";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, RouteChildrenProps, Redirect } from "react-router";
import { GlobalContext } from "./GlobalContext";
import { Page404 } from "./components/Page404";
import { CConfirmDialog } from "./components/Dialog";
import { hot } from "react-hot-loader";
import { DelayChild } from "./components/LazyLoader";
import { makePageComponent } from "./gen";
declare const module: any;

import db from "../dev/db.json";
if (false) db; // for hot reload when db.json changes

const theme = createMuiTheme();

interface UrlParam {
  currentProduct: string;
  currentPage: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuBackground: {
      backgroundColor: theme.palette.background.paper,
      height: "100%",
      position: "fixed",
      top: 0,
      width: 241,
      zIndex: -1,
      borderRight: `solid 1px ${theme.palette.divider}`,
    },
    body: {
      display: "flex",
    },
    menu: {
      height: 0,
      position: "sticky",
      top: 0,
    },
    content: {
      flexGrow: 1,
    },
  }),
);

const RedirectToDefaultPage = ({
  match,
  topMenus,
}: {
  match: any;
  topMenus: TopMenu[];
}) => {
  const currentProduct = match?.params.currentProduct;
  const topMenu = topMenus.find(topMenu => topMenu.name === currentProduct);
  if (topMenu && topMenu.menus && topMenu.menus[0]) {
    return <Redirect to={`/${topMenu!.name}/${topMenu.menus[0].name}`} />;
  }
  return <Page404 topMenus={topMenus} />;
};

const CurrentPage = ({
  route,
  settings,
}: {
  route: RouteChildrenProps<UrlParam>;
  settings: GlobalSettings;
}) => {
  const classes = useStyles();
  const { match, location, history } = route;
  const { isExact, url } = match!;
  const { currentProduct, currentPage } = match!.params;
  const { topMenus } = settings;
  // make sure add slash after currentPage, much easier for relative path
  if (isExact && !_.endsWith(url, "/")) {
    history.replace(`${url}/${location.search}`);
  }
  const action = _.trimStart(location.pathname.substring(url.length), "/");

  const topMenu = topMenus.find(({ name }) => name === currentProduct);
  const sideMenu = topMenu && findMenu(topMenu, currentPage);
  if (
    !topMenu ||
    !sideMenu ||
    ["new", "update", "view", ""].indexOf(action) === -1
  ) {
    return <Page404 topMenus={topMenus} />;
  }

  const page = {
    ...sideMenu.page,
    actionForSingleRow: action as UIAction,
    isMultiRowsUI: !action,
  };
  const globalContextValue = {
    selectedTopMenu: topMenu,
    selectedSideMenu: {
      ...sideMenu,
      page,
    },
  };

  return (
    <GlobalContext.Provider value={globalContextValue}>
      <Header topMenus={topMenus} selected={topMenu.name} />
      <div className={classes.menuBackground}></div>
      <div className={classes.body}>
        <div className={classes.menu}>
          <Menu topMenu={topMenu} selected={sideMenu.name} />
        </div>
        <div className={classes.content}>
          <DelayChild depends={[currentPage, currentProduct]}>
            {makePageComponent.bind(null, settings, page)}
          </DelayChild>
        </div>
      </div>
    </GlobalContext.Provider>
  );
};

const handleUserConfirm = async (
  message: string,
  callback: (b: boolean) => void,
) => {
  callback(await CConfirmDialog(message));
};

export default hot(module)(() => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DelayChild>
        {async () => {
          const settings = await getGlobalSettings();
          return () => (
            <Router getUserConfirmation={handleUserConfirm}>
              <Switch>
                <Route exact path="/">
                  {() => <Redirect to={`/${settings.topMenus[0].name}`} />}
                </Route>
                <Route exact path="/:currentProduct">
                  {({ match }) => (
                    <RedirectToDefaultPage
                      match={match}
                      topMenus={settings.topMenus}
                    />
                  )}
                </Route>
                <Route path="/:currentProduct/:currentPage">
                  {props => <CurrentPage settings={settings} route={props} />}
                </Route>
                <Route path="*">
                  <Page404 topMenus={settings.topMenus} />
                </Route>
              </Switch>
            </Router>
          );
        }}
      </DelayChild>
    </ThemeProvider>
  );
});
