import React from "react";
import { makeInput } from "./input";
import { Entity, UIRowCodeEditor } from "./types";
import { makeRadioGroup } from "./radioGroup";
import { makeSelect } from "./select";
import { makeCheckbox } from "./checkbox";
import { UIPage, UIRow } from "./types";
import { Formik, Form, FormikHelpers, Field } from "formik";
import FormControl from "@material-ui/core/FormControl";
import { CButton } from "../Buttons";
import { RESTfulRepository } from "../../framework/repository";
import {
  goToPath,
  toPath,
  goToSearch,
  withQueryParam,
  removeQueryParam,
} from "../../framework/locationHelper";
import { useHistory } from "react-router";
import { makeCodeEditor } from "./CodeEditor";
import { useTheme } from "@material-ui/core";
import { CSelect } from "../Select";
import Query from "query-string";

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
  rows,
  entity,
  defaultValues,
  settings,
}: UIPage): Promise<React.ComponentType<any>> => {
  const { endPointPrefix } = settings;
  const repo = new RESTfulRepository<Entity>(endPointPrefix, entity.name);
  const rowComponents = await makeRowComponents(endPointPrefix, rows!);

  return () => {
    const history = useHistory();
    const handleSubmit = async (
      values: Entity,
      { setSubmitting }: FormikHelpers<Entity>,
    ) => {
      await repo.add(values);
      goToPath(history, toPath("."));
      setSubmitting(false);
    };

    const handleCancel = () => {
      goToPath(history, toPath("."));
    };

    return (
      <>
        {
          <Formik
            initialValues={defaultValues}
            validate={handleValidation.bind(null, rows!)}
            onSubmit={handleSubmit}
            enableReinitialize={true}
            data-test-id={`form-${entity.name}`}
          >
            {props => (
              <Form>
                {rowComponents.map((Row, i) => (
                  <Row key={i} {...props} />
                ))}
                {
                  <div>
                    <CButton
                      type="submit"
                      primary
                      disabled={!props.dirty || props.isSubmitting}
                      text="Save"
                    />
                    <CButton text="Cancel" onClick={handleCancel} />
                  </div>
                }
              </Form>
            )}
          </Formik>
        }
      </>
    );
  };
};

const handleValidation = (rows: UIRow[], values: Entity) => {
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
  settings,
  rows,
  entity,
  isDedicatedSingular,
}: UIPage): Promise<React.ComponentType<any>> => {
  const { endPointPrefix } = settings;
  const rowComponents = await makeRowComponents(endPointPrefix, rows!);

  const repo = new RESTfulRepository<Entity>(endPointPrefix, entity.name);
  const list = isDedicatedSingular ? ((await repo.getList()) as Entity[]) : [];
  const firstEntity = list.length > 0 ? list[0] : undefined;

  return () => {
    const history = useHistory();
    const handleSubmit = async (
      values: Entity,
      { setSubmitting }: FormikHelpers<Entity>,
    ) => {
      {
        setValues(await repo.update(values.id!, values));
        setSubmitting(false);
      }
    };

    const query = Query.parse(history.location.search) as {
      [key: string]: string | number | undefined;
    };
    const entityId = query.id || firstEntity?.id;
    const [values, setValues] = React.useState(firstEntity);
    React.useEffect(() => {
      repo.get(entityId).then(setValues);
    }, [entityId]);

    const handleCancel = () => {
      goToPath(history, toPath(".", removeQueryParam("id")));
    };

    return (
      <>
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
            onSubmit={handleSubmit}
            enableReinitialize={true}
            data-test-id={`form-${entity.name}`}
          >
            {props => (
              <Form>
                {rowComponents.map((Row, i) => (
                  <Row key={i} {...props} />
                ))}
                {
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
                }
              </Form>
            )}
          </Formik>
        )}
      </>
    );
  };
};
