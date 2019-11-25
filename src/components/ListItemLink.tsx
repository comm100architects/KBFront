import * as React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

export interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
  selected: boolean;
  className?: string;
}

export const ListItemLink = ({
  icon,
  primary,
  to,
  selected,
  className,
}: ListItemLinkProps) => {
  const renderLink = React.useMemo(
    () =>
      React.forwardRef<
        HTMLAnchorElement,
        Omit<RouterLinkProps, "innerRef" | "to">
      >((itemProps, ref) => (
        // With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
        // See https://github.com/ReactTraining/react-router/issues/6056
        <RouterLink to={to} {...itemProps} innerRef={ref} />
      )),
    [to],
  );

  return (
    <ListItem
      className={className}
      button
      component={renderLink}
      selected={selected}
    >
      {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      <ListItemText primary={primary} />
    </ListItem>
  );
};
