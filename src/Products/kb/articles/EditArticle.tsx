import * as React from "react";
import * as _ from "lodash";
import Page from "../../../components/Page";
import { CLinkButton, CButton } from "../../../components/Buttons";
import { Article } from "./Entity/Article";
import { Formik, Field, Form, FormikHelpers } from "formik";
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
import {
  CategoryTree,
  makeCategoryTree,
  findRootCategory,
} from "./Domain/CategoryDomain";

interface CategoryPath {
  id: string;
  path: string;
}

const buildCategoryPath = (
  root: CategoryTree,
  path: string = "",
): CategoryPath[] => {
  const p: CategoryPath = {
    id: root.id,
    path:
      path === "/" || root.title === "/"
        ? path + root.title
        : `${path}/${root.title}`,
  };
  return _.flatten([
    p,
    ...root.children.map(tree => buildCategoryPath(tree, p.path)),
  ]);
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
      minWidth: 200,
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

  const location = useLocation();
  const [categories, setCategories] = React.useState([] as CSelectOption[]);
  React.useEffect(() => {
    const kbId = Query.parse(location.search).kbId as string;
    categoryDomain.getCategories(kbId).then(categories => {
      const tree = makeCategoryTree(categories, findRootCategory(categories));
      setCategories(
        buildCategoryPath(tree).map(({ id, path }) => ({
          value: id,
          text: path,
        })),
      );
    });
  }, [location.search]);

  const handleSubmit = async (
    values: Article,
    { setSubmitting }: FormikHelpers<Article>,
  ) => {
    await props.onSave(values);
    setSubmitting(false);
  };

  const handleValidation = (values: Article) => {
    const errors: Partial<Values> = {};
    if (!values.title) {
      errors.title = "Required";
    }
    if (!values.url) {
      errors.url = "Required";
    }
    return errors;
  };

  return (
    <Page title={props.title}>
      <Formik
        initialValues={props.article}
        validate={handleValidation}
        onSubmit={handleSubmit}
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
                <CSelect
                  id="editArticle-category"
                  label="Category"
                  onChange={categoryId =>
                    setFieldValue("categoryId", categoryId)
                  }
                  value={values.categoryId}
                  items={categories}
                />
              </FormControl>
              <FormControl>
                <CSelect
                  id="editArticle-status"
                  label="Status"
                  value={values.status}
                  onChange={status => setFieldValue("status", status)}
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
