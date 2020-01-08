import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { TopMenu, SideMenu } from "./gen/types";
import { ListItemLink } from "./components/ListItemLink";
import { CIcon } from "./components/Icons";

const useStyles = makeStyles(_ => ({
  root: {
    flexShrink: 0,
    width: 240,
  },
  expander: {
    fontWeight: 700,
  },
}));

const makeMenuItem = (productName: string, item: SideMenu) => ({
  selected,
}: {
  selected: string;
}) => (
  <ListItemLink
    selected={selected === item.name}
    to={`/${productName}/${item.name}/`}
    primary={item.label}
    icon={<CIcon name={item.icon || "blank"} />}
  ></ListItemLink>
);

const makeSubMenu = (productName: string, menu: SideMenu) => {
  const submenu = menu.submenu!;
  const menuItems = submenu.map(item => makeMenuItem(productName, item));
  return ({ selected }: { selected: string }) => {
    const [isOpen, setIsOpen] = React.useState(
      submenu.some(({ name }) => name === selected),
    );
    const handleClick = () => setIsOpen(!isOpen);
    return (
      <>
        <ListItem button onClick={handleClick}>
          <ListItemIcon>
            <CIcon name={menu.icon || "blank"} />
          </ListItemIcon>
          <ListItemText primary={menu.label} />
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {menuItems.map((Item, i) => (
              <Item key={i} selected={selected} />
            ))}
          </List>
        </Collapse>
      </>
    );
  };
};

export const makeMenu = ({ name, menu }: TopMenu) => {
  const menus = menu.map(item => {
    if (item.submenu) {
      return makeSubMenu(name, item);
    }
    return makeMenuItem(name, item);
  });

  return ({ selected }: { selected: string }) => {
    const classes = useStyles();

    return (
      <List component="nav" className={classes.root}>
        {menus.map((Menu, i) => (
          <Menu key={i} selected={selected} />
        ))}
      </List>
    );
  };
};
