import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Link from "@material-ui/core/Link";
import { ListItemLink } from "./components/ListItemLink";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { TopMenu } from "./gen/types";

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
      position: "initial",
    },
    link: {
      borderRadius: theme.shape.borderRadius,
    },
  }),
);

const makeProductLink = (product: TopMenu) => ({
  selected,
}: {
  selected: boolean;
}) => {
  const classes = useStyles();
  const defaultMenuName =
    product.menus && product.menus[0] && `${product.menus[0].name}/`;
  return (
    <ListItemLink
      key={product.name}
      primary={product.label}
      to={`/${product.name}/${defaultMenuName}`}
      selected={selected}
      className={classes.link}
    />
  );
};

export const makeHeader = (topMenus: TopMenu[]) => {
  const productLinks = topMenus.map(makeProductLink);
  return ({ selected }: { selected: string }) => {
    const classes = useStyles();
    const selectedIndex = topMenus.findIndex(({ name }) => name === selected);
    return (
      <AppBar elevation={0} position="absolute" className={classes.header}>
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
              {productLinks.map((ProductLink, i) => (
                <ProductLink key={i} selected={selectedIndex === i} />
              ))}
            </List>
          </Typography>
        </Toolbar>
      </AppBar>
    );
  };
};
