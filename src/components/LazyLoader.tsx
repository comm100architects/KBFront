import React from "react";
import LoadError from "./LoadError";
import Spin from "./Spin";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

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

interface DelayChildProps {
  children: () => Promise<React.ComponentType<any>>;
  depends?: any[];
}

export const DelayChild: React.ComponentType<DelayChildProps> = ({
  depends,
  children,
}: DelayChildProps) => {
  const [count, setCount] = React.useState(0);
  const makeLazyChild = () =>
    React.lazy(async () => {
      try {
        return {
          default: await children(),
        };
      } catch (e) {
        console.error(e);
        return {
          default: () => (
            <LoadError error={e} onReload={() => setCount(count + 1)} />
          ),
        };
      }
    });
  const LazyChild =
    depends === undefined
      ? makeLazyChild()
      : React.useMemo(makeLazyChild, depends!);
  return (
    <React.Suspense fallback={<Loading />}>
      <LazyChild />
    </React.Suspense>
  );
};
