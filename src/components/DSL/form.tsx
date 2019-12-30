import React from "react";
import { makeInput } from "./input";
import { Entity, UIRowCodeEditor } from "./types";
import { makeRadioGroup } from "./radioGroup";
import { makeSelect } from "./select";
import { makeCheckbox } from "./checkbox";

import { useGlobal } from "./context";
import { UIPage, UIRow } from "./types";
import { Formik, Form, FormikHelpers, Field } from "formik";
import FormControl from "@material-ui/core/FormControl";
import { CButton } from "../Buttons";
import { RESTfulRepository } from "../../framework/repository";
import { goToPath, toPath } from "../../framework/locationHelper";
import { useHistory } from "react-router";
import { makeCodeEditor } from "./CodeEditor";
import { useTheme } from "@material-ui/core";

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
      return makeCodeEditor(row as UIRowCodeEditor);
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
  return ({ initialValues, setFieldValue, values, errors }) => {
    const { field } = row;
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
      const theme = useTheme();

      return (
        <FormControl
          required={field.isRequired}
          error={!!errors[field.name]}
          style={{
            display: "block",
            paddingLeft: row.indent ? `${theme.spacing(4)}px` : "0px",
            marginTop: `${theme.spacing(3)}px`,
            marginBottom: `${theme.spacing(3)}px`,
          }}
        >
          <Field
            data-test-id={`form-field-${i}`}
            title={field.title}
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

export const makeFormComponent = async ({
  settings,
  rows,
  entity,
  type,
  defaultValues,
}: UIPage): Promise<React.ComponentType<any>> => {
  const isNew = type === "singularNew";
  const { endPointPrefix } = settings;
  const rowComponents = await Promise.all(
    rows!.map((row: UIRow, i: number) =>
      makeUIRowFormCtrol(endPointPrefix, row, i),
    ),
  );

  const repo = new RESTfulRepository<Entity>(endPointPrefix, entity.name);

  return () => {
    const history = useHistory();
    const handleSubmit = async (
      values: Entity,
      { setSubmitting }: FormikHelpers<Entity>,
    ) => {
      if (isNew) {
        await repo.add(values);
        goToPath(history, toPath("."));
      } else {
        setValues(await repo.update(values.id!, values));
        setSubmitting(false);
      }
    };

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

    const [values, setValues] = React.useState(
      isNew ? defaultValues : (null as Entity | null),
    );
    const [entityId] = useGlobal("query.id");
    React.useEffect(() => {
      if (!isNew) repo.get(entityId).then(setValues);
    }, []);

    const handleCancel = () => {
      goToPath(history, toPath("."));
    };

    return (
      values && (
        <Formik
          initialValues={values!}
          validate={handleValidation}
          onSubmit={handleSubmit}
          enableReinitialize={true}
          data-test-id={`form-${entity.name}`}
        >
          {props => (
            <Form>
              {rowComponents.map((Row, i) => {
                Row.displayName = "UIRow";
                return <Row key={i} {...props} />;
              })}
              {isNew ? (
                <div>
                  <CButton
                    type="submit"
                    primary
                    disabled={!props.dirty || props.isSubmitting}
                    text="Save"
                  />
                  <CButton text="Cancel" onClick={handleCancel} />
                </div>
              ) : (
                <div>
                  <CButton
                    type="submit"
                    primary
                    disabled={!props.dirty || props.isSubmitting}
                    text="Save Changes"
                  />
                  <CButton
                    type="reset"
                    disabled={!props.dirty || props.isSubmitting}
                    text="Discard"
                  />
                </div>
              )}
            </Form>
          )}
        </Formik>
      )
    );
  };
};
