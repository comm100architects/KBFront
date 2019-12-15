import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Link from "@material-ui/core/Link";
import { ListItemLink } from "./Components/ListItemLink";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/toolbar";
import Typography from "@material-ui/core/Typography";
import { rawProducts, RawProduct } from "./Pages";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    horizontalList: {
      display: "flex",
      flexDirection: "row",
      padding: 0,
      flexGrow: 0,
    },
    header: {
      zIndex: theme.zIndex.drawer + 1,
    },
    link: {
      borderRadius: theme.shape.borderRadius,
    },
  }),
);

const AppName = (
  currentApp: string,
  app: RawProduct,
  className: string,
): JSX.Element => (
  <ListItemLink
    primary={app.label}
    to={`/${app.name}/${app.defaultPage}/`}
    selected={app.name === currentApp}
    className={className}
  />
);

export default ({ currentApp }: { currentApp: string }): JSX.Element => {
  const classes = useStyles({});
  return (
    <AppBar elevation={0} position="fixed" className={classes.header}>
      <Toolbar>
        <div className={classes.grow}>
          <Link href="https://comm100.com" target="_blank">
            <img
              alt="Comm100"
              width="130"
              src="https://hosted.comm100.com/resources/comm100.png"
            />
          </Link>
        </div>
        <Typography component="div" noWrap>
          <List component="nav" className={classes.horizontalList}>
            {rawProducts.map(app => AppName(currentApp, app, classes.link))}
          </List>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
