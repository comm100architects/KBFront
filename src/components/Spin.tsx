import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import CircularProgress, {
  CircularProgressProps
} from "@material-ui/core/CircularProgress";

// Inspired by the Facebook spinners.
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative"
    },
    top: {
      color: theme.palette.primary.main
    },
    bottom: {
      color: "#6798e5",
      animationDuration: "750ms",
      position: "absolute",
      left: 0
    }
  })
);

export default function(props: CircularProgressProps) {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <CircularProgress
        variant="determinate"
        value={100}
        className={classes.top}
        size={50}
        thickness={4}
        {...props}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        className={classes.bottom}
        size={50}
        thickness={4}
        {...props}
      />
    </div>
  );
}
