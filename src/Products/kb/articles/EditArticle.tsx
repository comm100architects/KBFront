import React from "react";
import _ from "lodash";
import { CPage } from "../../../components/Page";
import { CButton } from "../../../components/Buttons";
import { Article } from "./Entity/Article";
import { ErrorMessage, Formik, Field, Form, FormikHelpers } from "formik";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import HtmlEditor from "../../../components/HtmlEditor";
import { useHistory, useLocation } from "react-router";
import { CSelect, CSelectOption } from "../../../components/Select";
import { CInput } from "../../../components/Input";
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
import { StatusSelect } from "./StatusSelect";
import { withProps } from "../../../framework/hoc";
import FormHelperText from "@material-ui/core/FormHelperText";

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
      flexDirection: "column",
      "& > *": {
        marginTop: theme.spacing(2),
      },
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

const inputText = withProps(CInput, { type: "text" });
const inputUrl = withProps(CInput, { type: "url" });

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
          label: path,
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
    <CPage title={props.title}>
      <Formik
        initialValues={props.article}
        validate={handleValidation}
        onSubmit={handleSubmit}
      >
        {({ submitForm, isSubmitting, errors }) => (
          <Form className={classes.form}>
            <FormControl required error={!!errors.title}>
              <Field
                id="articleTitle"
                as={inputText}
                name="title"
                label="Title"
                autoFocus
              />
              <ErrorMessage component={FormHelperText} name="title" />
            </FormControl>
            <FormControl required error={!!errors.url}>
              <Field id="articleUrl" as={inputUrl} name="url" label="URL" />
              <ErrorMessage component={FormHelperText} name="url" />
            </FormControl>
            <FormControl>
              <Field as={HtmlEditor} name="content" />
            </FormControl>
            <FormControl required>
              <Field
                id="articleCategory"
                as={CSelect}
                name="categoryId"
                options={categories}
                title="Category"
              />
            </FormControl>
            <FormControl required>
              <Field as={StatusSelect} name="status" />
            </FormControl>
            <div>
              <CButton
                disabled={isSubmitting}
                onClick={submitForm}
                text="Save"
                primary
              />
              <CButton to={toPath(".", removeQueryParam("id"))} text="Cancel" />
            </div>
          </Form>
        )}
      </Formik>
    </CPage>
  );
}
