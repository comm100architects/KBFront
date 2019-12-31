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
import { makeHeader } from "./Header";
import { makeMenu } from "./Menu";
import { isMenuExist, RawProduct, getMenuPages } from "./Pages";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, RouteChildrenProps, Redirect } from "react-router";
import { PageRouter } from "./PageRouter";
import { fetchJson } from "./framework/network";
import { GlobalSettings } from "./components/DSL/types";
import { GlobalContext } from "./GlobalContext";

const theme = createMuiTheme();

interface UrlParam {
  currentProduct: string;
  currentPage: string;
}

function Page404() {
  React.useEffect(() => {
    document.title = "404 Not Found";
  }, []);
  return <h1>404 Not Found</h1>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    menu: {
      flexShrink: 0,
      width: 240,
    },
    content: {
      flexGrow: 1,
    },
    toolbar: theme.mixins.toolbar,
  }),
);

interface RootProps {
  product: RawProduct;
  currentPage: string;
  relatviePath: string;
  pageId?: string;
}

const makeRoot = (settings: GlobalSettings): React.ComponentType<RootProps> => {
  const Header = makeHeader(settings.menu);
  return ({ product, currentPage, relatviePath, pageId }: RootProps) => {
    const Menu = React.useMemo(() => makeMenu(product), [product.name]);
    const classes = useStyles();
    return (
      <GlobalContext.Provider value={{ product, settings }}>
        <div className={classes.root}>
          <Header selected={product.name} />
          <Drawer variant="permanent" className={classes.menu}>
            <div className={classes.toolbar}></div>
            <Menu selected={currentPage} />
          </Drawer>
          <div className={classes.content}>
            <div className={classes.toolbar}></div>
            <PageRouter
              currentPage={currentPage}
              pageId={pageId}
              relatviePath={relatviePath}
            />
          </div>
        </div>
      </GlobalContext.Provider>
    );
  };
};

const getGlobalSettings = async () => {
  const res = (await fetchJson("/globalSettings", "GET")) as GlobalSettings;
  const menu = (await fetchJson(
    `//${res.endPointPrefix}/menu`,
    "GET",
  )) as RawProduct[];
  res.menu = menu;
  return res;
};

const makeRedirectToProductDefaultPage = (settings: GlobalSettings) => ({
  match,
}: RouteChildrenProps<UrlParam>) => {
  const currentProduct = match?.params.currentProduct;
  const product = settings.menu.find(
    product => product.name === currentProduct,
  );
  if (product) {
    return <Redirect to={`/${product!.name}/${product!.defaultPage}`} />;
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

    const product = settings.menu.find(
      product => product.name === currentProduct,
    );

    if (!isMenuExist(currentPage, product?.menu ?? [])) {
      return <Page404 />;
    }

    const relatviePath = location.pathname.substring(
      `/${currentProduct}/${currentPage}/`.length,
    );

    // pageRef could be null
    const pageRef = getMenuPages(currentPage, product!.menu).find(
      pageRef => pageRef.relatviePath === relatviePath,
    );

    if (pageRef?.redirectTo) {
      history.replace(pageRef.redirectTo + location.search);
    }

    return (
      <Root
        product={product!}
        currentPage={currentPage}
        pageId={pageRef?.pageId}
        relatviePath={relatviePath}
      />
    );
  };
};

getGlobalSettings()
  .then((settings: GlobalSettings) => {
    ReactDOM.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Switch>
            <Route exact path="/:currentProduct">
              {makeRedirectToProductDefaultPage(settings)}
            </Route>
            <Route path="/:currentProduct/:currentPage">
              {makeCurrentPage(settings)}
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
