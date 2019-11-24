import * as React from "react";
import Page from "../../../components/Page";
import {
  Submit,
  Cancel,
  ExternalLinkButton,
} from "../../../components/Buttons";
import { Article, ArticleCategory } from "./State";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import HtmlEditor from "../../../components/HtmlEditor";
import ChipInput from "material-ui-chip-input";

const categories: ArticleCategory[] = [
  { id: "1", label: "/" },
  { id: "2", label: "Live Chat" },
  { id: "3", label: "Ticket" },
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: "flex",
    },
    formControl: {
      marginTop: theme.spacing(2),
    },
    formLeft: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      marginRight: theme.spacing(2),
    },
    formRight: {
      width: 240,
      display: "flex",
      flexDirection: "column",
    },
    chip: {
      margin: theme.spacing(0.5),
    },
  }),
);

export interface EditArticleProps extends React.Props<{}> {
  title?: string | undefined;
  state: Article;
}

interface Values {
  title: string;
  url: string;
}

export default (props: EditArticleProps): JSX.Element => {
  const classes = useStyles({});
  return (
    <Page title={props.title ?? "Edit Article"}>
      <Formik
        initialValues={props.state}
        validate={values => {
          const errors: Partial<Values> = {};
          if (!values.title) {
            errors.title = "Required";
          }
          if (!values.url) {
            errors.url = "Required";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            setSubmitting(false);
            alert(JSON.stringify(values, null, 2));
          }, 500);
        }}
        render={({ submitForm, isSubmitting, setFieldValue, values }) => (
          <Form className={classes.form}>
            <div className={classes.formLeft}>
              <Field
                name="title"
                type="text"
                label="Title"
                component={TextField}
                className={classes.formControl}
                autoFocus
              />
              <Field
                name="url"
                type="url"
                label="URL"
                component={TextField}
                className={classes.formControl}
              />
              <FormControl className={classes.formControl}>
                <HtmlEditor
                  value={values.content}
                  onChange={html => setFieldValue("content", html)}
                />
              </FormControl>
            </div>
            <div className={classes.formRight}>
              <Submit
                disabled={isSubmitting}
                onClick={submitForm}
                className={classes.formControl}
              >
                Save
              </Submit>
              <Cancel to="" className={classes.formControl}>
                Cancel
              </Cancel>
              <ExternalLinkButton
                to="//ent.comm100.com/kb/1000007-25-a459?preview=true&source=edit"
                className={classes.formControl}
              >
                Preview
              </ExternalLinkButton>
              <Field
                select
                name="status"
                label="Status"
                component={TextField}
                className={classes.formControl}
              >
                <MenuItem key="draft" value="draft">
                  Draft
                </MenuItem>
                <MenuItem key="published" value="published">
                  Published
                </MenuItem>
              </Field>
              <Field
                select
                name="category"
                label="Category"
                component={TextField}
                className={classes.formControl}
              >
                {categories.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.label}
                  </MenuItem>
                ))}
              </Field>
              <FormControl className={classes.formControl}>
                <ChipInput
                  label="Tags"
                  defaultValue={["foo", "bar"]}
                  newChipKeyCodes={[32]}
                  onChange={chips => setFieldValue("tags", chips)}
                />
              </FormControl>
            </div>
          </Form>
        )}
      />
    </Page>
  );
};
