import * as React from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { GlobalContext } from "../GlobalContext";

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
      marginBottom: theme.spacing(5),
    },
    footer: {
      textAlign: "center",
      marginTop: theme.spacing(2),
    },
  }),
);

interface CPageProps extends React.Props<{}> {
  title?: string;
  description?: string;
  documentTitle?: string;
}

export const CPage = ({
  title,
  documentTitle,
  description,
  children,
}: CPageProps): JSX.Element => {
  const classes = useStyles({});
  const context = React.useContext(GlobalContext)!;
  const product = context.product!;
  const { poweredByHtml } = context.settings!;
  React.useEffect(() => {
    if (title) document.title = documentTitle ?? `${product.label} » ${title}`;
  }, [product.label, title, documentTitle]);
  return (
    <div className={classes.root}>
      <Paper component="main" className={classes.main}>
        <Typography
          data-test-id="page-title"
          variant="h4"
          noWrap
          className={classes.title}
        >
          {title}
        </Typography>
        {description && (
          <div dangerouslySetInnerHTML={{ __html: description }}></div>
        )}
        {children}
      </Paper>
      <footer
        className={classes.footer}
        dangerouslySetInnerHTML={{ __html: poweredByHtml }}
      ></footer>
    </div>
  );
};
CPage.displayName = "CPage";
