import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Link from "@material-ui/core/Link";
import { ListItemLink } from "./Components/ListItemLink";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/toolbar";
import Typography from "@material-ui/core/Typography";
import { RawProduct } from "./gen/types";

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

const makeProductLink = (product: RawProduct) => ({
  selected,
}: {
  selected: boolean;
}) => {
  const classes = useStyles();
  return (
    <ListItemLink
      key={product.name}
      primary={product.label}
      to={`/${product.name}/${product.defaultPage}/`}
      selected={selected}
      className={classes.link}
    />
  );
};

export const makeHeader = (menu: RawProduct[]) => {
  const productLinks = menu.map(makeProductLink);
  return ({ selected }: { selected: string }) => {
    const classes = useStyles();
    const selectedIndex = menu.findIndex(({ name }) => name === selected);
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
