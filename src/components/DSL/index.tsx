import React from "react";
import _ from "lodash";
import {
  IRepository,
  ReadonlyLocalRepository,
  RESTfulRepository,
} from "../../framework/repository";
import CPage from "../Page";
import { fetchJson } from "../../framework/network";
import { useHistory } from "react-router";
import LoadError from "../../components/LoadError";
import {
  GlobalContext,
  GlobalQueryString,
  GlobalState,
  useGlobal,
} from "./context";
import { makeInput, RawInput, makeInput2 } from "./input";
import {
  RepositoryMap,
  RawRadioGroup,
  RawSelect,
  RawCheckbox,
  RawControl,
  CustomComponent,
  RawDiv,
  EntityInfo,
  RawPage,
  Entity,
  RawForm,
  UIRowRadioGroup,
  normalizeRawUIPage,
  RawUIPage,
} from "./types";
import { makeForm } from "./form";
import { makeDiv } from "./div";
import { makeRadioGroup, makeRadioGroup2 } from "./radioGroup";
import { makeSelect, makeSelect2 } from "./select";
import { makeCheckbox, makeCheckbox2 } from "./checkbox";

const toRepositoryMap = (entities: EntityInfo[]): RepositoryMap => {
  const list = entities.map(info => {
    if (typeof info.source === "string") {
      return {
        name: info.name,
        repository: new RESTfulRepository(
          info.source,
          info.name,
        ) as IRepository<Entity>,
      };
    }
    if (_.isArray(info.source)) {
      return {
        name: info.name,
        repository: new ReadonlyLocalRepository(
          info.source as Entity[],
        ) as IRepository<Entity>,
      };
    }
    return {
      name: info.name,
      repository: new ReadonlyLocalRepository([
        info.source as Entity,
      ]) as IRepository<Entity>,
    };
  });

  return list.reduce((res, { name, repository }) => {
    res[name] = repository;
    return res;
  }, {} as RepositoryMap);
};

const makeComponent = (
  repositories: RepositoryMap,
  ctrl: RawControl | CustomComponent,
): Promise<React.ComponentType<any>> => {
  if (typeof ctrl === "function") {
    return (ctrl as CustomComponent)(repositories);
  }

  const control = (ctrl as RawControl).control;

  switch (control) {
    case "div":
      return makeDiv(repositories, ctrl as RawDiv, makeComponent);
    case "form":
      return makeForm(repositories, ctrl as RawForm, makeComponent);
    case "input":
      return makeInput(ctrl as RawInput);
    case "radioGroup":
      return makeRadioGroup(repositories, ctrl as RawRadioGroup);
    case "checkbox":
      return makeCheckbox(ctrl as RawCheckbox);
    case "select":
      return makeSelect(repositories, ctrl as RawSelect);
    default:
      throw new Error(`Unsupport control: ${control}`);
  }
};

const makePageComponentHelper = async (
  configUrl: string,
  injecter: (ui: RawControl) => RawControl,
): Promise<React.ComponentType> => {
  //  1. get config file
  //  2. create react component according to the config file
  //    - Get initial values from remote server in this step
  //  3. return the component, the caller decide when to render the component
  const { entities, ui, title }: RawPage = await fetchJson(configUrl, "GET");
  const repositories = toRepositoryMap(entities);
  const Body = await makeComponent(repositories, injecter(ui));
  return () => {
    const history = useHistory();
    const [state, setState] = React.useState();
    const globalVariables = {
      query: new GlobalQueryString(history),
      state: new GlobalState(state, setState),
    };
    return (
      <GlobalContext.Provider value={globalVariables}>
        <CPage title={title}>
          <Body />
        </CPage>
      </GlobalContext.Provider>
    );
  };
};

export const makePageComponent = async (
  configUrl: string,
  injecter: (ui: RawControl) => RawControl = a => a,
): Promise<React.ComponentType> => {
  try {
    return await makePageComponentHelper(configUrl, injecter);
  } catch (error) {
    // initialize error, show error message and reload button
    return () => {
      const handleReload = async () => {
        const component = await makePageComponentHelper(configUrl, injecter);
        setEle(React.createElement(component));
      };

      const [ele, setEle] = React.useState(() => (
        <LoadError error={error} onReload={handleReload} />
      ));

      return ele;
    };
  }
};

export const findForm = (root: RawControl): RawForm | null => {
  if (root.control === "form") return root as RawForm;
  else if (root.control === "div") {
    const children = (root as RawDiv).children;
    if (_.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if ((child as RawControl).control) {
          const res = findForm(child as RawControl);
          if (res) {
            return res;
          }
        }
      }
    }
  }
  return null;
};

// NEW VERSION
//
//
//
//

import { UIPage, UIGroup, UIRow, UIRowSelect, UIRowCheckbox } from "./types";
import { Formik, Form, FormikHelpers, Field } from "formik";
import Button from "@material-ui/core/Button";
export const makeUIRowComponent = async (
  repositories: RepositoryMap,
  row: UIRow,
): Promise<React.ComponentType<any>> => {
  switch (row.componentType) {
    case "select":
      return makeSelect2(repositories, row as UIRowSelect);
    case "checkbox":
      return makeCheckbox2(row as UIRowCheckbox);
    case "radioGroup":
      return makeRadioGroup2(repositories, row as UIRowRadioGroup);
    case "input":
      return makeInput2(row);
    default:
      throw new Error(`Unsupport componentType: ${row.componentType}`);
  }
};
export const makeUIRowFormCtrol = async (
  repositories: RepositoryMap,
  row: UIRow,
  i: number,
  j: number,
): Promise<React.ComponentType<any>> => {
  const component = await makeUIRowComponent(repositories, row);
  return () => (
    <Field
      data-test-id={`form-field-${i}-${j}`}
      title={row.field.title}
      name={row.field.name}
      as={component}
    ></Field>
  );
};
export const makeUIGroupComponent = async (
  repositories: RepositoryMap,
  group: UIGroup,
  i: number,
): Promise<React.ComponentType<any>> => {
  const rowComponents = await Promise.all(
    group.rows.map((row: UIRow, j: number) =>
      makeUIRowFormCtrol(repositories, row, i, j),
    ),
  );
  return () => (
    <div style={{ paddingLeft: group.indent * 30 }}>
      {group.title && <h6 data-test-id="group-title">{group.title}</h6>}
      {...rowComponents.map(React.createElement)}
    </div>
  );
};

export const makeFormComponent = async ({
  repositories,
  groups,
  entity,
  fields,
}: UIPage) => {
  const groupComponents = await Promise.all(
    groups.map((group: UIGroup, i: number) =>
      makeUIGroupComponent(repositories, group, i),
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
          {({ isSubmitting, dirty }) => (
            <Form>
              {...groupComponents.map(React.createElement)}
              <div>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!dirty || isSubmitting}
                >
                  Save Changes
                </Button>
                <Button
                  type="reset"
                  variant="contained"
                  color="default"
                  disabled={!dirty || isSubmitting}
                >
                  Discard
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )
    );
  };
};

export const makePageComponent2 = async (
  configUrl: string,
): Promise<React.ComponentType<any>> => {
  const page = normalizeRawUIPage(
    (await fetchJson(configUrl, "GET")) as RawUIPage,
  );
  const Body = await makeFormComponent(page);
  return () => {
    const history = useHistory();
    const [state, setState] = React.useState();
    const globalVariables = {
      query: new GlobalQueryString(history),
      state: new GlobalState(state, setState),
    };
    return (
      <GlobalContext.Provider value={globalVariables}>
        <CPage title={page.title}>
          <Body />
        </CPage>
      </GlobalContext.Provider>
    );
  };
};
