import * as React from "react";
import Page from "../../../components/Page";
import { CLinkButton, CButton } from "../../../components/Buttons";
import { Article, rootCategory, CategoryTree } from "./Model";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import HtmlEditor from "../../../components/HtmlEditor";
import ChipInput from "material-ui-chip-input";
import Chip from "@material-ui/core/Chip";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";

type DisplayCategory = {
  id: string;
  path: string;
};

const displayCategories = ({
  id,
  label,
  children,
}: CategoryTree): DisplayCategory[] => {
  const sep = label === "/" ? "" : "/";
  const result = children
    .map(child => displayCategories(child))
    .reduce((res, list) => res.concat(list), [])
    .map(c => ({ id: c.id, path: label + sep + c.path }));
  result.unshift({ id: id, path: label });
  return result;
};

const categories: DisplayCategory[] = displayCategories(rootCategory);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: "flex",
    },
    formLeft: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      marginRight: theme.spacing(2),
      "& > *": {
        marginTop: theme.spacing(2),
      },
    },
    formRight: {
      width: 240,
      display: "flex",
      flexDirection: "column",
      "& > *": {
        marginTop: theme.spacing(2),
      },
    },
    chip: {
      margin: theme.spacing(0.5),
    },
    urlPrefix: {
      userSelect: "none",
      height: 24,
      fontSize: "inherit",
      marginRight: theme.spacing(0.5),
    },
  }),
);

export interface EditArticleProps extends React.Props<{}> {
  title?: string | undefined;
  state: Article;
  onSave(article: Article): void;
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
            // alert(JSON.stringify(values, null, 2));
            props.onSave(values);
          }, 500);
        }}
        render={({ submitForm, isSubmitting, setFieldValue, values }) => (
          <Form className={classes.form}>
            <div className={classes.formLeft}>
              <Field
                name="title"
                type="text"
                label="Title"
                InputProps={{
                  "aria-label": "title",
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="featured"
                        size="small"
                        onClick={() =>
                          setFieldValue("featured", !values.featured)
                        }
                      >
                        <StarIcon
                          color={values.featured ? "primary" : "action"}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                component={TextField}
                autoFocus
              />
              <Field
                name="url"
                type="url"
                label="URL"
                component={TextField}
                InputProps={{
                  "aria-label": "title",
                  startAdornment: (
                    <Chip
                      className={classes.urlPrefix}
                      label="https://mycompany.comm100.io/kb/"
                    />
                  ),
                }}
              />
              <FormControl>
                <HtmlEditor
                  value={values.content}
                  onChange={html => setFieldValue("content", html)}
                />
              </FormControl>
            </div>
            <div className={classes.formRight}>
              <CButton
                disabled={isSubmitting}
                onClick={submitForm}
                text="Save"
                primary
              />
              <CLinkButton path="." text="Cancel" />
              <CLinkButton
                external
                path="//ent.comm100.com/kb/1000007-25-a459?preview=true&source=edit"
                text="Preview"
              />
              <Field select name="status" label="Status" component={TextField}>
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
              >
                {categories.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.path}
                  </MenuItem>
                ))}
              </Field>
              <FormControl>
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
