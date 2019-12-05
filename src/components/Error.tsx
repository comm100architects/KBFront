import * as React from "react";
import Paper from "@material-ui/core/Paper";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    error: {
      borderColor: "red",
      backgroundColor: "red",
      color: "white",
    },
  }),
);

interface ErrorProps {
  title?: string;
  message: string;
}

export default ({ message }: ErrorProps) => {
  const classes = useStyles();
  return <Paper className={classes.error}>{message}</Paper>;
};
