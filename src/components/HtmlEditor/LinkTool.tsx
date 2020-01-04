import * as React from "react";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import DoneIcon from "@material-ui/icons/Done";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2),
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-end",
    },
    urlInput: {
      width: 240,
    },
  }),
);

interface LinkToolProps {
  id: string;
  onChange(url: string): void;
  onClose?(event: {}, reason: string): void;
  anchorEl?: Element;
  open: boolean;
}

export default ({ id, open, anchorEl, onChange, onClose }: LinkToolProps) => {
  const classes = useStyles({});
  const [url, setUrl] = React.useState("");
  const handleUrlChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(evt.target.value);
  };

  const handleDoneClick = () => onChange(url);
  const isUrlValid = () => Boolean(url) && url !== "";

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      onClose={onClose}
    >
      <Typography className={classes.typography}>
        <TextField
          className={classes.urlInput}
          label="URL"
          value={url}
          autoFocus
          onChange={handleUrlChange}
        />
        <IconButton
          disabled={!isUrlValid()}
          color="primary"
          size="small"
          aria-label="done"
          onClick={handleDoneClick}
        >
          <DoneIcon />
        </IconButton>
      </Typography>
    </Popover>
  );
};
