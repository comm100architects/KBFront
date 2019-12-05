import * as React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import { PropTypes } from "@material-ui/core";

interface ButtonProps extends React.Props<{}> {
  onClick?: React.MouseEventHandler<{}>;
  disabled?: boolean;
  primary?: boolean;
  text: string;
  id?: string;
}

export const CButton = (props: ButtonProps) => (
  <Button
    id={props.id}
    variant="contained"
    disabled={props.disabled}
    color={props.primary ? "primary" : "default"}
    onClick={props.onClick}
  >
    {props.text}
  </Button>
);

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  (props, ref) => <RouterLink innerRef={ref} {...props} />,
);

interface LinkButtonProps extends React.Props<{}> {
  path: string;
  text: string;
  disabled?: boolean;
  external?: boolean;
  color?: PropTypes.Color;
}

export const CLinkButton = (props: LinkButtonProps) => (
  <Button
    variant="contained"
    to={props.path}
    target={props.external ? "_blank" : ""}
    component={Link}
    color={props.color}
  >
    {props.text}
  </Button>
);

interface LinkIconProps extends React.Props<{}> {
  to: string;
  target?: string;
  size?: "small" | "medium";
  title?: string;
}
export const LinkIcon = (props: LinkIconProps) => (
  <IconButton
    component={Link}
    to={props.to}
    target={props.target}
    size={props.size}
    title={props.title}
  >
    {props.children}
  </IconButton>
);
