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

const ProductLink = ({
  topMenu,
  selected,
}: {
  topMenu: TopMenu;
  selected: boolean;
}) => {
  const classes = useStyles();
  const defaultMenuName =
    topMenu.menus && topMenu.menus[0] && `${topMenu.menus[0].name}/`;
  return (
    <ListItemLink
      key={topMenu.name}
      primary={topMenu.label}
      to={`/${topMenu.name}/${defaultMenuName}`}
      selected={selected}
      className={classes.link}
    />
  );
};

export const Header = ({
  topMenus,
  selected,
}: {
  topMenus: TopMenu[];
  selected: string;
}) => {
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
            {topMenus.map((topMenu, i) => (
              <ProductLink
                key={topMenu.label}
                topMenu={topMenu}
                selected={selectedIndex === i}
              />
            ))}
          </List>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
