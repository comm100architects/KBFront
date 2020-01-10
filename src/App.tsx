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
import {
  TopMenu,
  GlobalSettings,
  SideMenu,
  findMenu,
  UIAction,
} from "./gen/types";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, RouteChildrenProps, Redirect } from "react-router";
import { GlobalContext } from "./GlobalContext";
import { Page404 } from "./components/Page404";
import { CConfirmDialog } from "./components/Dialog";
import { hot } from "react-hot-loader";
import { DelayChild } from "./components/LazyLoader";
import { makePageComponent } from "./gen";
declare const module: any;

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

interface RootProps {
  selectedTopMenu: TopMenu;
  selectedSideMenu: SideMenu;
  settings: GlobalSettings;
}

const Root = ({ selectedTopMenu, selectedSideMenu, settings }: RootProps) => {
  const { topMenus } = settings;
  const classes = useStyles();
  return (
    <GlobalContext.Provider value={{ selectedTopMenu, selectedSideMenu }}>
      <Header topMenus={topMenus} selected={selectedTopMenu.name} />
      <div className={classes.menuBackground}></div>
      <div className={classes.body}>
        <div className={classes.menu}>
          <Menu topMenu={selectedTopMenu} selected={selectedSideMenu.name} />
        </div>
        <div className={classes.content}>
          <DelayChild>
            {() => makePageComponent(settings, selectedSideMenu.page)}
          </DelayChild>
        </div>
      </div>
    </GlobalContext.Provider>
  );
};
Root.displayName = "Root";

const makeRedirectToProductDefaultPage = (topMenus: TopMenu[]) => ({
  match,
}: RouteChildrenProps<UrlParam>) => {
  const currentProduct = match?.params.currentProduct;
  const product = topMenus.find(product => product.name === currentProduct);
  if (product && product.menus && product.menus[0]) {
    return <Redirect to={`/${product!.name}/${product.menus[0].name}`} />;
  }
  return <Page404 topMenus={topMenus} />;
};

const makeCurrentPage = (settings: GlobalSettings) => {
  return ({ match, location, history }: RouteChildrenProps<UrlParam>) => {
    const { currentProduct, currentPage } = match!.params;
    // make sure add slash after currentPage, much easier for relative path
    if (match!.isExact && !_.endsWith(location.pathname, "/")) {
      history.replace(`/${currentProduct}/${currentPage}/${location.search}`);
    }

    const selectedTopMenu = settings.topMenus.find(
      ({ name }) => name === currentProduct,
    );
    const selectedSideMenu =
      selectedTopMenu && findMenu(selectedTopMenu, currentPage);
    const action = location.pathname.substring(
      `/${currentProduct}/${currentPage}/`.length,
    );
    if (
      !selectedTopMenu ||
      !selectedSideMenu ||
      ["new", "update", "view", ""].indexOf(action) === -1
    ) {
      return <Page404 topMenus={settings.topMenus} />;
    }

    const selectedSideMenu2 = {
      ...selectedSideMenu,
      page: {
        ...selectedSideMenu.page,
        actionForSingleRow: action as UIAction,
        isMultiRowsUI: !action,
      },
    };

    return (
      <Root
        settings={settings}
        selectedTopMenu={selectedTopMenu}
        selectedSideMenu={selectedSideMenu2}
      />
    );
  };
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
                  () => (<Redirect to={`/${settings.topMenus[0].name}`} />
                  );
                </Route>
                <Route exact path="/:currentProduct">
                  {makeRedirectToProductDefaultPage(settings.topMenus)}
                </Route>
                <Route path="/:currentProduct/:currentPage">
                  {makeCurrentPage(settings)}
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
