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
import { makeHeader } from "./Header";
import { makeMenu } from "./Menu";
import {
  TopMenu,
  GlobalSettings,
  SideMenu,
  findMenu,
  UIAction,
} from "./gen/types";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, RouteChildrenProps, Redirect } from "react-router";
import { PageRouter } from "./PageRouter";
import { GlobalContext, getGlobalSettings } from "./GlobalContext";
import { Page404 } from "./components/Page404";
import { CConfirmDialog } from "./components/Dialog";

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
  product: TopMenu;
  sideMenu: SideMenu;
}

const makeRoot = (settings: GlobalSettings): React.ComponentType<RootProps> => {
  const Header = makeHeader(settings.topMenus);
  return ({ product, sideMenu }: RootProps) => {
    const page = {
      ...sideMenu.page,
      isMultiRowsUI: !sideMenu.page.actionForSingleRow,
    };
    const Menu = React.useMemo(() => makeMenu(product), [product.name]);
    const classes = useStyles();
    return (
      <GlobalContext.Provider value={{ ...settings, selectedTopMenu: product }}>
        <Header selected={product.name} />
        <div className={classes.menuBackground}></div>
        <div className={classes.body}>
          <div className={classes.menu}>
            <Menu selected={sideMenu.name} />
          </div>
          <div className={classes.content}>
            <PageRouter {...page} />
          </div>
        </div>
      </GlobalContext.Provider>
    );
  };
};

const makeRedirectToProductDefaultPage = (settings: GlobalSettings) => ({
  match,
}: RouteChildrenProps<UrlParam>) => {
  const currentProduct = match?.params.currentProduct;
  const product = settings.topMenus.find(
    product => product.name === currentProduct,
  );
  if (product && product.menus && product.menus[0]) {
    return <Redirect to={`/${product!.name}/${product.menus[0].name}`} />;
  }
  return <Page404 />;
};

const makeCurrentPage = (settings: GlobalSettings) => {
  const Root = makeRoot(settings);
  Root.displayName = "Root";
  return ({ match, location, history }: RouteChildrenProps<UrlParam>) => {
    const { currentProduct, currentPage } = match!.params;
    // make sure add slash after currentPage, much easier for relative path
    if (match!.isExact && !_.endsWith(location.pathname, "/")) {
      history.replace(`/${currentProduct}/${currentPage}/${location.search}`);
    }

    const product = settings.topMenus.find(
      product => product.name === currentProduct,
    );
    const sideMenu = product && findMenu(product, currentPage);
    const action = location.pathname.substring(
      `/${currentProduct}/${currentPage}/`.length,
    );
    if (
      !product ||
      !sideMenu ||
      ["new", "update", "view", ""].indexOf(action) === -1
    ) {
      return <Page404 />;
    }

    sideMenu.page.actionForSingleRow = action as UIAction;

    return <Root product={product} sideMenu={sideMenu} />;
  };
};

const handleUserConfirm = async (
  message: string,
  callback: (b: boolean) => void,
) => {
  callback(await CConfirmDialog(message));
};

getGlobalSettings()
  .then((settings: GlobalSettings) => {
    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <GlobalContext.Provider value={settings}>
          <CssBaseline />
          <Router getUserConfirmation={handleUserConfirm}>
            <Switch>
              <Route exact path="/">
                () => (
                <Redirect to={`/${settings.topMenus[0].name}`} />
                );
              </Route>
              <Route exact path="/:currentProduct">
                {makeRedirectToProductDefaultPage(settings)}
              </Route>
              <Route path="/:currentProduct/:currentPage">
                {makeCurrentPage(settings)}
              </Route>
              <Route path="*">
                <Page404 />
              </Route>
            </Switch>
          </Router>
        </GlobalContext.Provider>
      </ThemeProvider>,
      document.querySelector("#main"),
    );
  })
  .catch(e => {
    console.error(e);
    ReactDOM.render(<h2>Oops...</h2>, document.querySelector("#main"));
  });
