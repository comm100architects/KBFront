import * as React from "react";
import Typography from "@material-ui/core/typography";
import Paper from "@material-ui/core/paper";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import GlobalContext from "../GlobalContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
    main: {
      padding: theme.spacing(3),
      position: "relative",
    },
    title: {
      marginBottom: theme.spacing(2),
    },
  }),
);

interface CPageProps extends React.Props<{}> {
  title: string;
  documentTitle?: string;
}

export default (props: CPageProps): JSX.Element => {
  const classes = useStyles({});
  const { currentApp } = React.useContext(GlobalContext);
  React.useEffect(() => {
    document.title =
      props.documentTitle ?? `${currentApp.label} » ${props.title}`;
  }, [currentApp.label, props.title, props.documentTitle]);
  return (
    <div className={classes.root}>
      <Paper component="main" className={classes.main}>
        <Typography variant="h4" noWrap className={classes.title}>
          {props.title}
        </Typography>
        {props.children}
      </Paper>
    </div>
  );
};
