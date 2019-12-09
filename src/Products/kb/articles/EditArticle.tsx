import * as React from "react";
import Page from "../../../components/Page";
import { CLinkButton, CButton } from "../../../components/Buttons";
import { CategoryTree } from "./Model";
import { Article } from "./Entity/Article";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import HtmlEditor from "../../../components/HtmlEditor";
import ChipInput from "material-ui-chip-input";
import Chip from "@material-ui/core/Chip";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";
import { useHistory, useLocation } from "react-router";
import { CSelect, CSelectOption } from "../../../components/Select";
import * as Query from "query-string";
import { DomainContext } from "./context";
import {
  goToPath,
  toPath,
  removeQueryParam,
} from "../../../framework/locationHelper";

interface DisplayCategory {
  id: string;
  path: string;
}

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
  title: string;
  article: Article;
  onSave(article: Article): Promise<void>;
}

interface Values {
  title: string;
  url: string;
}

export const EditArticle = (): JSX.Element => {
  const location = useLocation();
  const articleId = Query.parse(location.search).id as string;
  const { articleDomain } = React.useContext(DomainContext)!;

  const history = useHistory();
  const [article, setArticle] = React.useState(null as Article | null);
  React.useEffect(() => {
    articleDomain.getArticle(articleId).then(setArticle);
  }, []);
  if (article) {
    return (
      <ArticleComponent
        title="Edit Article"
        onSave={async article => {
          await articleDomain.updateArticle(article);
          goToPath(history, toPath(".", removeQueryParam("id")));
          return Promise.resolve();
        }}
        article={article!}
      />
    );
  }
  return <></>;
};

export function ArticleComponent(props: EditArticleProps): JSX.Element {
  const classes = useStyles();
  const { categoryDomain } = React.useContext(DomainContext)!;

  const [categories, setCategories] = React.useState([] as CSelectOption[]);
  React.useEffect(() => {
    categoryDomain.getCategories().then(categories => {
      setCategories(categories.map(c => ({ value: c.id, text: c.title })));
    });
  }, [categoryDomain]);

  return (
    <Page title={props.title}>
      <Formik
        initialValues={props.article}
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
        onSubmit={async (values, { setSubmitting }) => {
          await props.onSave(values);
          setSubmitting(false);
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
              <CLinkButton
                to={toPath(".", removeQueryParam("id"))}
                text="Cancel"
              />
              <CLinkButton
                external
                to="//ent.comm100.com/kb/1000007-25-a459?preview=true&source=edit"
                text="Preview"
              />
              <FormControl>
                <CSelect value={values.categoryId} items={categories} />
              </FormControl>
              <FormControl>
                <CSelect
                  value={values.status}
                  items={[
                    {
                      value: 1,
                      text: "Published",
                    },
                    {
                      value: 0,
                      text: "Draft",
                    },
                  ]}
                />
              </FormControl>
              <FormControl>
                <ChipInput
                  label="Tags"
                  defaultValue={values.tags}
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
}
