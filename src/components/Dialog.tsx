import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import ReactDOM from "react-dom";

export interface CDialogProps extends React.Props<{}> {
  title?: string;
  onOk?: () => void;
  onCancel?: () => void;
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

  const handleCancel = () => {
    setOpen(false);

    if (props.onCancel) {
      props.onCancel();
    }
  };

  const handleOk = () => {
    setOpen(false);

    if (props.onOk) {
      props.onOk();
    }
  };

  return (
    <Dialog onClose={handleCancel} open={open}>
      <DialogTitle>{props.title || ""}</DialogTitle>
      <Paper component="div" elevation={0} className={classes.content}>
        {props.children}
      </Paper>
      <DialogActions>
        <Button color="primary" onClick={handleOk}>
          OK
        </Button>
        <Button onClick={handleCancel}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export const CConfirmDialog = async (message: string): Promise<boolean> => {
  let container = document.getElementById("dedicated-dialogs");
  if (container) {
    ReactDOM.unmountComponentAtNode(container);
  } else {
    container = document.createElement("div");
    container.id = "dedicated-dialogs";
    document.body.insertBefore(container, document.body.firstChild!);
  }

  return new Promise(resolve => {
    ReactDOM.render(
      <CDialog onOk={() => resolve(true)} onCancel={() => resolve(false)}>
        {message}
      </CDialog>,
      container,
    );
  });
};
