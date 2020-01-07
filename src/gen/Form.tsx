import React from "react";
import { makeInput } from "./Input";
import { Entity } from "./types";
import { makeRadioGroup } from "./RadioGroup";
import { makeSelect } from "./Select";
import { makeCheckbox } from "./Checkbox";
import { UIPage, UIRow } from "./types";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import { Formik, Form, FormikHelpers, FormikProps, Field } from "formik";
import FormControl from "@material-ui/core/FormControl";
import { CButton } from "../components/Buttons";
import {
  goToPath,
  toPath,
  goToSearch,
  withQueryParam,
  removeQueryParam,
} from "../framework/locationHelper";
import { useHistory, Prompt, useLocation } from "react-router";
import { makeCodeEditor } from "./CodeEditor";
import FormLabel from "@material-ui/core/FormLabel";
import { CSelect } from "../components/Select";
import Query from "query-string";
import { CPage } from "../components/Page";
import {
  hasVariable,
  replaceVariables,
  evalConditions,
  emptyValueOfType,
} from "../framework/utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      display: "block",
      marginBottom: theme.spacing(3),
    },
    formControlIndent: {
      display: "block",
      marginBottom: theme.spacing(3),
      marginLeft: theme.spacing(3),
    },
    topRightCorner: {
      position: "absolute",
      top: theme.spacing(3),
      right: theme.spacing(3),
    },
    formFooter: {
      marginTop: theme.spacing(2),
      "& > button": {
        marginRight: theme.spacing(2),
      },
    },
  }),
);

export const makeUIRowComponent = async (
  row: UIRow,
): Promise<React.ComponentType<any>> => {
  switch (row.componentType) {
    case "select":
      return makeSelect(row.field);
    case "checkbox":
      return makeCheckbox(row.field);
    case "radioGroup":
      return makeRadioGroup(row.field);
    case "input":
      return makeInput();
    case "codeEditor":
      return makeCodeEditor();
    default:
      throw new Error(`Unsupport componentType: ${row.componentType}`);
  }
};
const rowHiddenPred = ({ conditionsToHide }: UIRow, values: any) => {
  return conditionsToHide && evalConditions(conditionsToHide!, values, true);
};
export const makeUIRow = async (
  row: UIRow,
  i: number,
): Promise<React.ComponentType<any>> => {
  const component = await makeUIRowComponent(row);
  const { field, indent } = row;
  return ({ values, error }) => {
    const classes = useStyles();
    if (rowHiddenPred(row, values)) {
      return <></>;
    } else {
      return (
        <FormControl
          className={
            indent > 0 ? classes.formControlIndent : classes.formControl
          }
          required={field.isRequired}
          error={error}
        >
          {field.label && <FormLabel component="div">{field.label}</FormLabel>}
          <Field
            data-test-id={`form-field-${i}`}
            name={field.name}
            as={component}
            autoFocus={i === 0}
          ></Field>
        </FormControl>
      );
    }
  };
};

const groupRows = (
  rows: UIRow[],
  components: React.ComponentType<any>[],
): React.ComponentType<any>[][] => {
  let lastIndent = rows[0].indent || 0;
  const ret = [];
  for (let i = 0, prev = 0; i < rows.length; i++) {
    const indent = rows[i].indent || 0;
    if (lastIndent !== indent) {
      ret.push(components.slice(prev, i));
      prev = i;
      lastIndent = indent;
    }
  }
  return ret;
};

const LeaveConfirm = () => {
  const message =
    "Changes you made may not be saved. Do you want to leave this page?";
  React.useEffect(() => {
    if (window.onbeforeunload) {
      console.warn("Should not override onbeforeunload");
    }

    window.onbeforeunload = () => {
      return message;
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, []);
  return <Prompt message={message} />;
};

const makeRows = async (rows: UIRow[]): Promise<React.ComponentType<any>> => {
  const rowComponents = await Promise.all(
    rows.map((row: UIRow, i: number) => makeUIRow(row, i)),
  );
  for (const r of rowComponents) {
    r.displayName = "UIRow";
  }
  return ({ initialValues, values, errors }) => (
    <>
      {rowComponents.map((Row, i) => (
        <Row
          key={rows[i].field.name}
          initialValue={initialValues[rows[i].field.name]}
          values={values}
          error={!!errors[rows[i].field.name]}
        />
      ))}
    </>
  );
};

const makeForm = async (rows: UIRow[]): Promise<React.ComponentType<any>> => {
  const Rows = await makeRows(rows);
  return ({ initialValues, isDiscardOrCancel, onSubmit }) => {
    const classes = useStyles();
    const history = useHistory();
    const [disableLeaveConfirm, setDisableLeaveConfirm] = React.useState(false);

    const handleValidation = (values: Entity) => {
      const errors: { [key: string]: string } = {};
      for (const row of rows) {
        const { field } = row;
        if (
          field.isRequired &&
          !rowHiddenPred(row, values) &&
          !values[field.name]
        ) {
          errors[field.name] = `${field.label} is required`;
        }
      }
      return errors;
    };
    const handleSubmit = async (
      values: Entity,
      { setSubmitting }: FormikHelpers<Entity>,
    ) => {
      await onSubmit(values);
      setSubmitting(false);
      if (!isDiscardOrCancel) {
        goBack();
      }
    };
    const goBack = () => {
      setDisableLeaveConfirm(true);
      setTimeout(
        () => goToPath(history, toPath(".", removeQueryParam("id"))),
        20,
      );
    };

    return (
      <Formik
        initialValues={initialValues}
        validate={handleValidation}
        validateOnChange={false}
        validateOnMount={false}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {(props: FormikProps<Entity>) => (
          <Form>
            <Rows
              initialValues={props.initialValues}
              values={props.values}
              errors={props.errors}
            />
            <div className={classes.formFooter}>
              <CButton
                type="submit"
                primary
                disabled={!props.dirty || props.isSubmitting}
                text="Save Changes"
              />
              {isDiscardOrCancel ? (
                <CButton
                  type="reset"
                  disabled={!props.dirty || props.isSubmitting}
                  text="Discard"
                />
              ) : (
                <CButton text="Cancel" onClick={goBack} />
              )}
              {(props.dirty || props.isSubmitting) && !disableLeaveConfirm && (
                <LeaveConfirm />
              )}
            </div>
          </Form>
        )}
      </Formik>
    );
  };
};

export const makeNewFormComponent = async ({
  title,
  description,
  rows,
  entityRepo,
  entity,
  defaultValues,
}: UIPage): Promise<React.ComponentType<any>> => {
  const Form = await makeForm(rows!);
  const initialValues = rows!.reduce((res, row) => {
    if (res[row.field.name] === undefined) {
      return { ...res, [row.field.name]: emptyValueOfType(row.field.type) };
    }
    return res;
  }, defaultValues);

  return () => {
    const handleSubmit = async (values: Entity) => {
      const newValues = Object.keys(query).reduce((res, k) => {
        if (
          entity.fields.some(
            ({ name, type }) => name === k && type === "reference",
          )
        ) {
          return { ...res, [k]: query[k] } as Entity;
        }
        return res;
      }, values);
      await entityRepo.add(newValues);
    };
    const location = useLocation();
    const query = Query.parse(location.search) as { [key: string]: string };
    return (
      <CPage title={title} description={description}>
        <Form
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isDiscardOrCancel={false}
        />
      </CPage>
    );
  };
};

export const makeEditFormComponent = async ({
  title,
  description,
  rows,
  entityRepo,
  isDedicatedSingular,
  entity,
}: UIPage): Promise<React.ComponentType<any>> => {
  const list = isDedicatedSingular
    ? ((await entityRepo.getList()) as Entity[])
    : [];
  const options = list.map(({ id, name, title }) => ({
    value: id,
    label: name || title,
  }));
  const firstEntity = list.length > 0 ? list[0] : undefined;
  const Form = await makeForm(rows!);

  return () => {
    const classes = useStyles();
    const history = useHistory();

    const query = Query.parse(history.location.search) as {
      [key: string]: string | number | undefined;
    };
    const entityId = query.id || firstEntity?.id;
    const initialValues = query.id ? undefined : firstEntity;
    const [values, setValues] = React.useState(initialValues);
    React.useEffect(() => {
      if (entityId !== initialValues?.id)
        entityRepo.get(entityId).then(setValues);
    }, [entityId]);

    const handleSubmit = async (values: Entity) => {
      setValues(await entityRepo.update(values.id!, values));
    };

    const pageTitle = () =>
      hasVariable(title) ? values && replaceVariables(title, values) : title;

    return (
      <CPage title={pageTitle()} description={description}>
        {isDedicatedSingular && options.length > 1 && (
          <div className={classes.topRightCorner}>
            <FormControl>
              {entity.label && <InputLabel>{entity.label}</InputLabel>}
              <CSelect
                value={entityId}
                options={options}
                onChange={({
                  target,
                }: React.ChangeEvent<{ value: string | number }>) => {
                  goToSearch(history, withQueryParam("id", target.value));
                }}
              />
            </FormControl>
          </div>
        )}
        {values && (
          <Form
            initialValues={values}
            onSubmit={handleSubmit}
            isDiscardOrCancel={isDedicatedSingular}
          />
        )}
      </CPage>
    );
  };
};
