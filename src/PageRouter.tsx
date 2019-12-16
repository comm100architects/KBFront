import * as React from "react";
import { Suspense } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Spin from "./components/Spin";
import LoadError from "./components/LoadError";
interface AppParam {
  currentApp: string;
  currentPage: string;
}
import { isPromise } from "./framework/utils";

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

export default class LazyPage extends React.Component<
  AppParam,
  {
    page: React.LazyExoticComponent<React.ComponentType<any>>;
    error: Error | null;
  }
> {
  constructor(props: AppParam) {
    super(props);

    this.state = { page: this.getPage(props), error: null };
  }

  getPage({ currentApp, currentPage }: AppParam) {
    return React.lazy(() =>
      import(
        /* webpackChunkName: "page" */
        `./Products/${currentApp}/${currentPage}/index.tsx`
      ).then(pack => {
        if (isPromise(pack.default)) {
          return pack.default.then((next: any) => ({ default: next }));
        }
        return pack;
      }),
    );
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  componentWillReceiveProps(nextProps: AppParam) {
    if (
      this.props.currentApp === nextProps.currentApp &&
      this.props.currentPage === nextProps.currentPage
    )
      return;

    this.setState({ page: this.getPage(nextProps), error: null });
  }

  reload() {
    this.setState({ page: this.getPage(this.props), error: null });
  }

  render() {
    const Page = this.state.page;
    if (this.state.error) {
      return (
        <LoadError error={this.state.error} onReload={() => this.reload()} />
      );
    }
    return (
      <Suspense fallback={<Loading />}>
        <Page />
      </Suspense>
    );
  }
}

// export default ({ currentApp, currentPage }: AppParam) => {
//   const lazyComponentsStore = React.useRef(
//     {} as { [id: string]: React.LazyExoticComponent<React.ComponentType<any>> },
//   ).current;
//   const path = `${currentApp}/${currentPage}`;
//   if (!lazyComponentsStore[path]) {
//     const page: React.LazyExoticComponent<React.ComponentType<
//       any
//     >> = React.lazy(() =>
//       import(
//         /* webpackChunkName: "page" */
//         `./Products/${currentApp}/${currentPage}/index.tsx`
//       ).catch(() =>
//         import(/* webpackMode: "eager" */ "./components/LoadError"),
//       ),
//     );
//
//     lazyComponentsStore[path] = page;
//   }
//   const LazyPage = lazyComponentsStore[path];
//   return (
//     <Suspense fallback={<Loading />}>
//       <LazyPage />
//     </Suspense>
//   );
// };
