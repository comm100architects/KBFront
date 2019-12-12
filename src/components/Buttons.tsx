import * as React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import * as H from "history";
import { CIcon, CIconName } from "./Icons";
import { CElementProps } from "./Base";

export interface CButtonProps extends CElementProps {
  onClick?: React.MouseEventHandler<{}>;
  disabled?: boolean;
  primary?: boolean;
  text: string;
  id?: string;
  to?:
    | H.LocationDescriptor<H.LocationState>
    | ((
        location: H.Location<H.LocationState>,
      ) => H.LocationDescriptor<H.LocationState>);
  external?: boolean;
}

export const CButton = (props: CButtonProps) => {
  if (props.onClick) {
    return (
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
  }

  if (props.to) {
    return (
      <Button
        id={props.id}
        variant="contained"
        disabled={props.disabled}
        color={props.primary ? "primary" : "default"}
        to={props.to!}
        target={props.external ? "_blank" : ""}
        component={Link}
      >
        {props.text}
      </Button>
    );
  }

  return <></>;
};

export interface CIconButtonProps extends CElementProps {
  title: string;
  icon: CIconName;
  onClick?: React.MouseEventHandler<{}>;
  to?:
    | H.LocationDescriptor<H.LocationState>
    | ((
        location: H.Location<H.LocationState>,
      ) => H.LocationDescriptor<H.LocationState>);
  external?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  (props, ref) => <RouterLink innerRef={ref} {...props} />,
);

export const CIconButton = (props: CIconButtonProps) => {
  if (props.onClick) {
    return (
      <IconButton title={props.title} onClick={props.onClick}>
        <CIcon name={props.icon} />
      </IconButton>
    );
  }
  if (props.to) {
    return (
      <IconButton
        component={Link}
        to={props.to}
        target={props.external ? "_blank" : ""}
        title={props.title}
      >
        <CIcon name={props.icon} />
      </IconButton>
    );
  }
  return <></>;
};
