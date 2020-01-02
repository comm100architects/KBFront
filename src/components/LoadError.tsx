import * as React from "react";
import { CPage } from "./Page";
import IconButton from "@material-ui/core/IconButton";
import ErrorIcon from "@material-ui/icons/Error";
import ReloadIcon from "@material-ui/icons/Replay";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "static",
    },
    error: {
      backgroundColor: theme.palette.error.dark,
    },
    message: {
      backgroundColor: theme.palette.error.dark,
      display: "flex",
      alignItems: "center",
    },
    icon: {
      opacity: 0.9,
    },
  }),
);

interface LoadErrorProps {
  error: Error;
  onReload(): void;
}

export default ({ error, onReload }: LoadErrorProps) => {
  const classes = useStyles();
  return (
    <CPage title="Load Error">
      <Snackbar
        open
        className={classes.root}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <SnackbarContent
          aria-describedby="error-message"
          role="alert"
          className={classes.error}
          message={
            <span id="error-message" className={classes.message}>
              <ErrorIcon className={classes.icon} />
              &nbsp;{error.message}
            </span>
          }
          action={
            <IconButton
              aria-label="reload"
              onClick={() => onReload()}
              color="inherit"
            >
              <ReloadIcon className={classes.icon} />
            </IconButton>
          }
        />
      </Snackbar>
    </CPage>
  );
};
