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

const MenuItem = ({
  topMenuName,
  item,
  selected,
}: {
  topMenuName: string;
  item: SideMenu;
  selected: string;
}) => (
  <ListItemLink
    selected={selected === item.name}
    to={`/${topMenuName}/${item.name}/`}
    primary={item.label}
    icon={<CIcon name={item.icon || "blank"} />}
  ></ListItemLink>
);

const SubMenu = ({
  topMenuName,
  menu,
  selected,
}: {
  topMenuName: string;
  menu: SideMenu;
  selected: string;
}) => {
  const submenu = menu.submenu!;
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
          {submenu.map((item, i) => (
            <MenuItem
              key={item.name}
              topMenuName={topMenuName}
              selected={selected}
              item={item}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

export const Menu = ({
  selected,
  topMenu,
}: {
  topMenu: TopMenu;
  selected: string;
}) => {
  const classes = useStyles();
  return (
    <List component="nav" className={classes.root}>
      {topMenu.menus.map(item => {
        if (item.submenu) {
          return (
            <SubMenu
              key={item.name}
              topMenuName={topMenu.name}
              selected={selected}
              menu={item}
            />
          );
        }
        return (
          <MenuItem
            key={item.name}
            topMenuName={topMenu.name}
            selected={selected}
            item={item}
          />
        );
      })}
    </List>
  );
};
