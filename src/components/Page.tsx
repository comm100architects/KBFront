import * as React from "react";
import Typography from "@material-ui/core/typography";
import Paper from "@material-ui/core/paper";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import GlobalContext from "../GlobalContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    main: {
      padding: theme.spacing(2),
    },
    content: {
      padding: theme.spacing(3),
    },
    title: {
      marginBottom: theme.spacing(2),
    },
  }),
);

interface PageProps extends React.Props<{}> {
  title: string;
  documentTitle?: string;
}

export default (props: PageProps): JSX.Element => {
  const classes = useStyles({});
  const { currentApp } = React.useContext(GlobalContext);
  React.useEffect(() => {
    document.title =
      props.documentTitle ?? `${currentApp.label} » ${props.title}`;
  });
  return (
    <main className={classes.main}>
      <Paper className={classes.content}>
        <Typography variant="h5" noWrap className={classes.title}>
          {props.title}
        </Typography>
        {props.children}
      </Paper>
    </main>
  );
};
