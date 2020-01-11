import * as React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import * as H from "history";
import { CIcon, CIconName } from "./Icons";
import { CElementProps } from "./Base";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      whiteSpace: "nowrap",
    },
  }),
);

interface CLinkBaseProps extends CElementProps {
  onClick?: React.MouseEventHandler<{}>;
  to?:
    | H.LocationDescriptor<H.LocationState>
    | ((
        location: H.Location<H.LocationState>,
      ) => H.LocationDescriptor<H.LocationState>);
  external?: boolean;
}

export interface CButtonProps extends CLinkBaseProps {
  disabled?: boolean;
  text: string;
  type?: "submit" | "reset";
  primary?: boolean;
}

export const CButton = (props: CButtonProps) => {
  const classes = useStyles();
  if (props.onClick || props.type) {
    return (
      <Button
        type={props.type}
        id={props.id}
        variant="contained"
        disabled={props.disabled}
        color={props.primary ? "primary" : "default"}
        onClick={props.onClick}
        className={classes.root}
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
        className={classes.root}
      >
        {props.text}
      </Button>
    );
  }

  return <></>;
};

export interface CIconButtonProps extends CLinkBaseProps {
  title: string;
  icon: CIconName;
}

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  (props, ref) => <RouterLink innerRef={ref} {...props} />,
);

export const CIconButton = (props: CIconButtonProps) => {
  if (props.onClick) {
    if (props.title) {
      return (
        <Tooltip title={props.title}>
          <IconButton onClick={props.onClick}>
            <CIcon name={props.icon} />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <IconButton title={props.title} onClick={props.onClick}>
        <CIcon name={props.icon} />
      </IconButton>
    );
  }
  if (props.to) {
    if (props.title) {
      return (
        <Tooltip title={props.title}>
          <IconButton
            component={Link}
            to={props.to}
            target={props.external ? "_blank" : ""}
          >
            <CIcon name={props.icon} />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <IconButton
        component={Link}
        to={props.to}
        target={props.external ? "_blank" : ""}
      >
        <CIcon name={props.icon} />
      </IconButton>
    );
  }
  return <></>;
};

export interface CLinkProps extends CLinkBaseProps {
  text: string;
}

export const CLink = (props: CLinkProps) => {
  return (
    <Link to={props.to!} onClick={props.onClick}>
      {props.text}
    </Link>
  );
};
