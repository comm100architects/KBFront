import React from "react";
import _ from "lodash";
import { Suspense } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Spin from "./components/Spin";
import LoadError from "./components/LoadError";
import { isPromise } from "./framework/utils";
import { makePageComponent } from "./gen";
import { GlobalContext } from "./GlobalContext";

interface PageRouterProps {
  currentPage: string;
  pageId?: string;
  relatviePath: string;
}

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      justifyContent: "center",
      paddingTop: "20%",
      display: "flex",
    },
  }),
);

const Loading = (_: {}) => {
  const classes = useStyles({});
  return (
    <div className={classes.content}>
      <Spin />
    </div>
  );
};

export const PageRouter = (props: PageRouterProps) => {
  const { currentPage, relatviePath, pageId } = props;
  const { settings, product } = React.useContext(GlobalContext)!;
  const [count, setCount] = React.useState(0);
  const LazyPage = React.useMemo(
    () =>
      React.lazy(async () => {
        try {
          if (pageId) {
            return {
              default: await makePageComponent(
                settings,
                `${settings.endPointPrefix}/pages/${pageId}`,
                relatviePath.toLowerCase(),
              ),
            };
          } else {
            const pack = await import(
              /* webpackChunkName: "page" */
              `./Products/${product.name}/${currentPage}/index.tsx`
            );
            if (isPromise(pack.default)) {
              const component = await pack.default;
              return { default: component };
            }
            return pack;
          }
        } catch (e) {
          console.log(e);
          return {
            default: () => (
              <LoadError error={e} onReload={() => setCount(count + 1)} />
            ),
          };
        }
      }),
    [currentPage, relatviePath, pageId, product, count],
  );
  return (
    <Suspense fallback={<Loading />}>
      <LazyPage />
    </Suspense>
  );
};

