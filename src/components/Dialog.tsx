import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

export interface CDialogProps extends React.Props<{}> {
  title?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      padding: theme.spacing(3),
      paddingTop: 0,
    },
  }),
);

export const CDialog = (props: CDialogProps) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOk = () => {
    setOpen(false);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      {props.title && <DialogTitle>{props.title}</DialogTitle>}
      <Paper component="div" className={classes.content}>
        {props.children}
      </Paper>
      <DialogActions>
        <Button color="primary" onClick={handleOk}>
          OK
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
