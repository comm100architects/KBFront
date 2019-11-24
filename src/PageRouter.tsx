import * as React from "react";
import { Suspense } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Spin from "./components/Spin";

interface AppParam {
  currentApp: string;
  currentPage: string;
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

export default ({ currentApp, currentPage }: AppParam) => {
  const LazyPage = React.lazy(() =>
    import(
      /* webpackChunkName: "page" */
      `./Products/${currentApp}/${currentPage}/index.tsx`
    ).catch(() => import(/* webpackMode: "eager" */ "./components/LoadError")),
  );

  return (
    <Suspense fallback={<Loading />}>
      <LazyPage />
    </Suspense>
  );
};
