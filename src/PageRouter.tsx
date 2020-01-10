import React from "react";
import _ from "lodash";
import { Suspense } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Spin from "./components/Spin";
import LoadError from "./components/LoadError";
import { makePageComponent } from "./gen";
import { GlobalContext } from "./GlobalContext";
import { PageProps } from "./gen/types";

// for hot reload when db.json changes
import db from "../dev/db.json";
if (false) db;

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

export const PageRouter = (props: PageProps) => {
  const [count, setCount] = React.useState(0);
  const settings = React.useContext(GlobalContext);
  const LazyPage = React.useMemo(
    () =>
      React.lazy(async () => {
        try {
          return {
            default: await makePageComponent(settings, props),
          };
          // } else {
          //   const pack = await import(
          //     /* webpackChunkName: "page" */
          //     `./Products/${product.name}/${currentPage}/index.tsx`
          //   );
          //   if (isPromise(pack.default)) {
          //     const component = await pack.default;
          //     return { default: component };
          //   }
          //   return pack;
          // }
        } catch (e) {
          console.error(e);
          return {
            default: () => (
              <LoadError error={e} onReload={() => setCount(count + 1)} />
            ),
          };
        }
      }),
    [props.entity, props.isMultiRowsUI, props.actionForSingleRow, count],
  );
  return (
    <Suspense fallback={<Loading />}>
      <LazyPage />
    </Suspense>
  );
};
