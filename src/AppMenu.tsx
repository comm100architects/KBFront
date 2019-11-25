import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { RawApp, RawMenuItem, RawSubMenu } from "./Pages";
import { ListItemLink } from "./Components/ListItemLink";

const useStyles = makeStyles(theme => ({
  root: {
    width: 240,
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
  },
  expander: {
    fontWeight: 700,
  },
}));

const renderMenuItem = (item: RawMenuItem): JSX.Element => (
  <SelectedMenuItem.Consumer>
    {({ appName, selected }) => (
      <ListItemLink
        selected={selected === item.name}
        to={`/${appName}/${item.name}/`}
        primary={item.label}
        icon={<item.icon />}
      ></ListItemLink>
    )}
  </SelectedMenuItem.Consumer>
);

const SubMenuComponent = ({
  menu,
  open,
}: {
  menu: RawSubMenu;
  open: boolean;
}): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState(open);

  function handleClick() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary={menu.label} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {menu.items.map(renderMenuItem)}
        </List>
      </Collapse>
    </>
  );
};

const SelectedMenuItem = React.createContext({
  appName: "",
  selected: "",
});

function AppMenuComponent(props: { app: RawApp; selected: string }) {
  const classes = useStyles({});
  const { app, selected } = props;

  const children = app.menu.map(item => {
    if ((item as RawMenuItem).name) {
      return renderMenuItem(item as RawMenuItem);
    }
    const submenu = item as RawSubMenu;
    const open = submenu.items.some(item => item.name === selected);
    return <SubMenuComponent menu={submenu} open={open} />;
  });

  return (
    <SelectedMenuItem.Provider value={{ selected, appName: app.name }}>
      <List component="nav" className={classes.root}>
        {children}
      </List>
    </SelectedMenuItem.Provider>
  );
}

export default AppMenuComponent;
