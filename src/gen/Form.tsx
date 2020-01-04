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
import { hasVariable, replaceVariables } from "../framework/utils";

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
export const makeUIRow = async (
  row: UIRow,
  i: number,
): Promise<React.ComponentType<any>> => {
  const component = await makeUIRowComponent(row);
  let hiddenPred = (_: any) => false;
  if (row.conditionsToHide) {
    const expression = row.conditionsToHide[0];
    const f = new Function(`return this.${expression}`);
    hiddenPred = (self: any) => f.call(self);
  }
  const { field, indent } = row;
  return ({ initialValue, setFieldValue, values, error }) => {
    const classes = useStyles();
    if (hiddenPred(values)) {
      if (initialValue !== values[field.name]) {
        setFieldValue(field.name, initialValue);
      }
      return <></>;
    } else {
      const val = values[field.name];
      if (typeof val === "string") {
        if (field.type === "int" || field.type === "enum") {
          setFieldValue(field.name, parseInt(val));
        } else if (field.type === "bool") {
          setFieldValue(field.name, val === "true");
        }
      }

      return (
        <FormControl
          className={
            indent > 0 ? classes.formControlIndent : classes.formControl
          }
          required={field.isRequired}
          error={error}
        >
          {field.title && <FormLabel component="div">{field.title}</FormLabel>}
          <Field
            data-test-id={`form-field-${i}`}
            name={field.name}
            as={component}
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
    rows!.map((row: UIRow, i: number) => makeUIRow(row, i)),
  );
  for (const r of rowComponents) {
    r.displayName = "UIRow";
  }
  return ({ initialValues, setFieldValue, values, errors }) => (
    <>
      {rowComponents.map((Row, i) => (
        <Row
          key={i}
          initialValue={initialValues[rows![i].field.name]}
          setFieldValue={setFieldValue}
          values={values}
          error={!!errors[rows![i].field.name]}
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
      for (let i = 0; i < rows!.length; i++) {
        const { field } = rows![i];
        if (field.isRequired && !values[field.name]) {
          errors[field.name] = `${field.title} is required`;
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
              setFieldValue={props.setFieldValue}
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
          initialValues={defaultValues}
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
              {entity.title && <InputLabel>{entity.title}</InputLabel>}
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
