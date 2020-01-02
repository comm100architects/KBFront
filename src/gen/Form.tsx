import React from "react";
import { makeInput } from "./Input";
import { Entity } from "./types";
import { makeRadioGroup } from "./RadioGroup";
import { makeSelect } from "./Select";
import { makeCheckbox } from "./Checkbox";
import { UIPage, UIRow } from "./types";
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
import { useHistory, Prompt } from "react-router";
import { makeCodeEditor } from "./CodeEditor";
import FormLabel from "@material-ui/core/FormLabel";
import { CSelect } from "../components/Select";
import Query from "query-string";
import { CPage } from "../components/Page";
import { replaceVariables } from "../framework/utils";

export const makeUIRowComponent = async (
  endPointPrefix: string,
  row: UIRow,
): Promise<React.ComponentType<any>> => {
  switch (row.componentType) {
    case "select":
      return makeSelect(endPointPrefix, row);
    case "checkbox":
      return makeCheckbox(row);
    case "radioGroup":
      return makeRadioGroup(endPointPrefix, row);
    case "input":
      return makeInput(row);
    case "codeEditor":
      return makeCodeEditor(row);
    default:
      throw new Error(`Unsupport componentType: ${row.componentType}`);
  }
};
export const makeUIRowFormCtrol = async (
  endPointPrefix: string,
  row: UIRow,
  i: number,
): Promise<React.ComponentType<any>> => {
  const component = await makeUIRowComponent(endPointPrefix, row);
  let hiddenPred = (_: any) => false;
  if (row.conditionsToHide) {
    const expression = row.conditionsToHide[0];
    const f = new Function(`return this.${expression}`);
    hiddenPred = (self: any) => f.call(self);
  }
  const { field } = row;
  return ({ initialValues, setFieldValue, values, errors }) => {
    if (hiddenPred(values)) {
      if (initialValues[field.name] !== values[field.name]) {
        setFieldValue(field.name, initialValues[field.name]);
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
      // const theme = useTheme();

      return (
        <FormControl
          required={field.isRequired}
          error={!!errors[field.name]}
          style={{
            display: "block",
            // paddingLeft: row.indent ? `${theme.spacing(4)}px` : "0px",
            // marginTop: `${theme.spacing(3)}px`,
            // marginBottom: `${theme.spacing(3)}px`,
          }}
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

const makeRowComponents = async (endPointPrefix: string, rows: UIRow[]) => {
  const rowComponents = await Promise.all(
    rows!.map((row: UIRow, i: number) =>
      makeUIRowFormCtrol(endPointPrefix, row, i),
    ),
  );
  for (const r of rowComponents) {
    r.displayName = "UIRow";
  }
  return rowComponents;
};

export const makeNewFormComponent = async ({
  title,
  description,
  rows,
  entity,
  entityRepo,
  defaultValues,
  settings,
}: UIPage): Promise<React.ComponentType<any>> => {
  const { endPointPrefix } = settings;
  const rowComponents = await makeRowComponents(endPointPrefix, rows!);

  return () => {
    const history = useHistory();
    const [disableLeaveConfirm, setDisableLeaveConfirm] = React.useState(false);
    const handleSubmit = async (values: Entity) => {
      await entityRepo.add(values);
      setDisableLeaveConfirm(true);
      setTimeout(() => goToPath(history, toPath(".")), 0);
    };

    const handleCancel = () => {
      setDisableLeaveConfirm(true);
      setTimeout(() => goToPath(history, toPath(".")), 0);
    };

    const form = (props: FormikProps<Entity>) => (
      <Form>
        {rowComponents.map((Row, i) => (
          <Row
            key={i}
            initialValues={props.initialValues}
            setFieldValue={props.setFieldValue}
            values={props.values}
            errors={props.errors}
          />
        ))}
        <div>
          <CButton
            type="submit"
            primary
            disabled={!props.dirty || props.isSubmitting}
            text="Save"
          />
          <CButton text="Cancel" onClick={handleCancel} />
        </div>
        {(props.dirty || props.isSubmitting) && !disableLeaveConfirm && (
          <LeaveConfirm />
        )}
      </Form>
    );
    return (
      <CPage title={title} description={description}>
        <Formik
          initialValues={defaultValues}
          validate={handleValidation.bind(null, rows!)}
          onSubmit={handleSubmit}
          enableReinitialize={true}
          data-test-id={`form-${entity.name}`}
          component={form}
        ></Formik>
      </CPage>
    );
  };
};

const handleValidation = (rows: UIRow[], values: Entity) => {
  console.log("handleValidation");
  const errors: { [key: string]: string } = {};
  for (let i = 0; i < rows!.length; i++) {
    const { field } = rows![i];
    if (field.isRequired && !values[field.name]) {
      errors[field.name] = `${field.title} is required`;
    }
  }
  return errors;
};

export const makeEditFormComponent = async ({
  title,
  description,
  settings,
  rows,
  entity,
  entityRepo,
  isDedicatedSingular,
}: UIPage): Promise<React.ComponentType<any>> => {
  const { endPointPrefix } = settings;
  const rowComponents = await makeRowComponents(endPointPrefix, rows!);

  const list = isDedicatedSingular
    ? ((await entityRepo.getList()) as Entity[])
    : [];
  const firstEntity = list.length > 0 ? list[0] : undefined;

  return () => {
    const history = useHistory();
    const [disableLeaveConfirm, setDisableLeaveConfirm] = React.useState(false);

    const handleSubmit = async (values: Entity) => {
      await entityRepo.update(values.id!, values);
      setDisableLeaveConfirm(true);
      setTimeout(
        () => goToPath(history, toPath(".", removeQueryParam("id"))),
        0,
      );
    };

    const query = Query.parse(history.location.search) as {
      [key: string]: string | number | undefined;
    };
    const entityId = query.id || firstEntity?.id;
    const [values, setValues] = React.useState(firstEntity);
    React.useEffect(() => {
      entityRepo.get(entityId).then(setValues);
    }, [entityId]);

    const handleCancel = () => {
      setDisableLeaveConfirm(true);
      setTimeout(
        () => goToPath(history, toPath(".", removeQueryParam("id"))),
        0,
      );
    };
    const form = (props: FormikProps<Entity>) => (
      <Form>
        {rowComponents.map((Row, i) => (
          <Row
            key={i}
            initialValues={props.initialValues}
            setFieldValue={props.setFieldValue}
            values={props.values}
            errors={props.errors}
          />
        ))}
        <div>
          <CButton
            type="submit"
            primary
            disabled={!props.dirty || props.isSubmitting}
            text="Save Changes"
          />
          {isDedicatedSingular ? (
            <CButton
              type="reset"
              disabled={!props.dirty || props.isSubmitting}
              text="Discard"
            />
          ) : (
            <CButton text="Cancel" onClick={handleCancel} />
          )}
        </div>
        {(props.dirty || props.isSubmitting) && !disableLeaveConfirm && (
          <LeaveConfirm />
        )}
      </Form>
    );
    return (
      <CPage
        title={values && replaceVariables(title, values)}
        description={description}
      >
        {isDedicatedSingular && list.length > 1 && (
          <div style={{ position: "absolute", top: "24px", right: "24px" }}>
            <CSelect
              value={entityId}
              options={list.map(({ id, name, title }) => ({
                value: id,
                label: name || title,
              }))}
              onChange={({
                target,
              }: React.ChangeEvent<{ value: string | number }>) => {
                goToSearch(history, withQueryParam("id", target.value));
              }}
            />
          </div>
        )}
        {values && (
          <Formik
            initialValues={values}
            validate={handleValidation.bind(null, rows!)}
            validateOnChange={false}
            validateOnMount={false}
            onSubmit={handleSubmit}
            enableReinitialize={true}
            data-test-id={`form-${entity.name}`}
            component={form}
          ></Formik>
        )}
      </CPage>
    );
  };
};
