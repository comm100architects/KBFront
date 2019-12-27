import React from "react";
import _ from "lodash";
import { Suspense } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Spin from "./components/Spin";
import LoadError from "./components/LoadError";
interface LazyPageProps {
  currentApp: string;
  currentPage: string;
  pageId?: string;
  relatviePath: string;
}
import { isPromise } from "./framework/utils";
import { fetchJson } from "./framework/network";
import { makePageComponent } from "./components/DSL";

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
  LazyPageProps,
  {
    page: React.LazyExoticComponent<React.ComponentType<any>>;
    error: Error | null;
  }
> {
  constructor(props: LazyPageProps) {
    super(props);

    this.state = { page: this.getPage(props), error: null };
  }

  getPage({ currentApp, currentPage, relatviePath, pageId }: LazyPageProps) {
    if (pageId) {
      return React.lazy(async () => {
        const settings = await fetchJson("/globalSettings", "GET");
        const configUrl = `${settings.endPointPrefix}/pages/${pageId}`;
        const isNew = relatviePath.toLowerCase() === "new";
        return {
          default: await makePageComponent(settings, configUrl, isNew),
        };
      });
    }
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

  componentWillReceiveProps(nextProps: LazyPageProps) {
    if (_.isEqual(this.props, nextProps)) return;

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

// export default ({ currentApp, currentPage }: LazyPageProps) => {
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
