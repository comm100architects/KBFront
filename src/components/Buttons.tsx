import * as React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

interface ButtonProps extends React.Props<{}> {
  onClick?: React.MouseEventHandler<{}>;
  disabled?: boolean;
  className?: string;
}

export const Submit = (props: ButtonProps) => (
  <Button
    className={props.className}
    variant="contained"
    disabled={props.disabled}
    color="primary"
    onClick={props.onClick}
  >
    {props.children}
  </Button>
);

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  (props, ref) => <RouterLink innerRef={ref} {...props} />,
);

interface LinkButtonProps extends React.Props<{}> {
  className?: string;
  to: string;
}

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

export const ExternalLinkButton = (props: LinkButtonProps) => (
  <Button
    className={props.className}
    variant="contained"
    to={props.to}
    target="_blank"
    component={Link}
  >
    {props.children}
  </Button>
);

export const New = (props: LinkButtonProps) => (
  <Button
    className={props.className}
    variant="contained"
    color="primary"
    to={props.to}
    component={Link}
  >
    {props.children}
  </Button>
);

export const Cancel = (props: LinkButtonProps) => (
  <Button
    className={props.className}
    variant="contained"
    to={props.to}
    component={Link}
  >
    {props.children}
  </Button>
);
