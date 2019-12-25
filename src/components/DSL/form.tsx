import React from "react";
import { makeInput } from "./input";
import { RepositoryMap, Entity } from "./types";
import { makeRadioGroup } from "./radioGroup";
import { makeSelect } from "./select";
import { makeCheckbox } from "./checkbox";

import { useGlobal } from "./context";
import { UIPage, UIRow } from "./types";
import { Formik, Form, FormikHelpers, Field } from "formik";
import FormControl from "@material-ui/core/FormControl";
import { CButton } from "../Buttons";

export const makeUIRowComponent = async (
  repositories: RepositoryMap,
  row: UIRow,
): Promise<React.ComponentType<any>> => {
  switch (row.componentType) {
    case "select":
      return makeSelect(repositories, row);
    case "checkbox":
      return makeCheckbox(row);
    case "radioGroup":
      return makeRadioGroup(repositories, row);
    case "input":
      return makeInput(row);
    default:
      throw new Error(`Unsupport componentType: ${row.componentType}`);
  }
};
export const makeUIRowFormCtrol = async (
  repositories: RepositoryMap,
  row: UIRow,
  i: number,
): Promise<React.ComponentType<any>> => {
  const component = await makeUIRowComponent(repositories, row);
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

      return (
        <FormControl
          required={field.isRequired}
          error={!!errors[field.name]}
          style={
            row.indent
              ? { display: "block", paddingLeft: `${row.indent * 30}px` }
              : { display: "block" }
          }
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

export const makeFormComponent = async ({
  repositories,
  rows,
  entity,
  fields,
}: UIPage): Promise<React.ComponentType<any>> => {
  const rowComponents = await Promise.all(
    rows!.map((row: UIRow, i: number) =>
      makeUIRowFormCtrol(repositories, row, i),
    ),
  );

  const repo = repositories[entity];

  return () => {
    const handleSubmit = async (
      values: Entity,
      { setSubmitting }: FormikHelpers<Entity>,
    ) => {
      setValues(await repo.update(values.id, values));
      setSubmitting(false);
    };

    const handleValidation = (values: Entity) => {
      const errors: { [key: string]: string } = {};
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.isRequired && !values[field.name]) {
          errors[field.name] = `${field.title} is required`;
        }
      }
      return errors;
    };

    const [values, setValues] = React.useState(null as Entity | null);
    const [entityId] = useGlobal("query.id");
    React.useEffect(() => {
      repo.get(entityId).then(setValues);
    }, []);

    return (
      values && (
        <Formik
          initialValues={values!}
          validate={handleValidation}
          onSubmit={handleSubmit}
          enableReinitialize={true}
          data-test-id={`form-${entity}`}
        >
          {props => (
            <Form>
              {rowComponents.map((Row, i) => {
                Row.displayName = "UIRow";
                return <Row key={i} {...props} />;
              })}
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
            </Form>
          )}
        </Formik>
      )
    );
  };
};
