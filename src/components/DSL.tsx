import * as React from "react";
import * as _ from "lodash";
import { CForm } from "./Form";
import { CInput } from "./Input";
import {
  IRepository,
  ReadonlyLocalRepository,
  RESTfulRepository,
} from "../framework/repository";
import { FieldInputProps } from "formik";
import CPage from "./Page";
import { CRadioGroup, CRadioGroupProps } from "./RadioGroup";
import { CCheckbox } from "./Checkbox";
import { CSelect, CSelectProps } from "./Select";
import { fetchJson } from "../framework/network";
import { withProps } from "../framework/hoc";
import { useLocation, useHistory } from "react-router";
import * as Query from "query-string";
import { CIconName } from "./Icons";
import { goToSearch } from "../framework/locationHelper";
import LoadError from "../components/LoadError";

export const RepositoryMapContext = React.createContext(
  {} as { [name: string]: IRepository<Entity> },
);

export type RepositoryMap = { [name: string]: IRepository<Entity> };

export type Entity = { id: string; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
}

export interface RawControl {
  control: "div" | "form" | "input" | "radioGroup" | "checkbox" | "select";
}

export interface RawDiv extends RawControl {
  children: RawControl | RawControl[];
}

export interface RawFieldInputControl extends RawControl {
  bind: string;
}

export interface RawInput extends RawFieldInputControl {
  title: string;
  type: "text" | "url" | "number" | "email";
}

export interface RawSelect extends RawFieldInputControl {
  title: string;
  data: { entity: string; label: string; value: string; icon: CIconName };
}

export interface RawRadioGroup extends RawFieldInputControl {
  title: string;
  data: { entity: string; label: string; value: string };
}

export interface RawCheckbox extends RawFieldInputControl {
  label: string;
  title: string;
}

export interface RawFormControl extends RawControl {
  name: string;
  title: string;
  required?: boolean;
}

export interface RawForm extends RawControl {
  children: RawFormControl[];
  data: { entity: string; id: string };
}

export interface RawPage {
  title: string;
  entities: EntityInfo[];
  ui: RawControl;
}

const parseVariable = (variable: string) => {
  const i = variable.indexOf(".");
  if (i > 0) {
    return {
      entity: variable.substring(0, i),
      path: variable.substring(i + 1),
    };
  }
  return { path: variable };
};

const makeForm = async (
  repositories: RepositoryMap,
  { data, children }: RawForm,
): Promise<React.ComponentType> => {
  const repo = repositories[data.entity];
  const fields = await Promise.all(
    children.map(async child => ({
      title: child.title,
      required: child.required,
      as: await makeFormControl(repositories, child),
      name: child.name,
    })),
  );
  const query = Query.parse(window.location.search);
  const kbId = _.get(query, parseVariable(data.id).path) as string;
  const initialValues = await repo.get(kbId);
  return () => {
    const handleSave = async (values: Entity) => {
      setValues(await repo.update(values.id, values));
      return;
    };
    const location = useLocation();

    const [values, setValues] = React.useState(initialValues);

    React.useEffect(() => {
      repo.get(getId(data.id)).then(setValues);
    }, [location.search]);

    const getId = (variable: string): string => {
      const { entity, path } = parseVariable(variable);
      if (entity === "query") {
        return _.get(Query.parse(location.search), path)! as string;
      }
      return path;
    };

    return (
      <>
        {values && (
          <CForm initialValues={values!} fields={fields} onSave={handleSave} />
        )}
      </>
    );
  };
};

const makeInput = async ({
  title,
  type,
}: RawInput): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => <CInput {...props} label={title} type={type} />;
};

const makeRadioGroup = async (
  repositories: RepositoryMap,
  { title, data }: RawRadioGroup,
): Promise<React.ComponentType<CRadioGroupProps>> => {
  const props = await repositories[data.entity].getList().then(options => ({
    options: options.map(option => ({
      value: option[data.value],
      label: option[data.label],
    })),
    title,
  }));

  return withProps(CRadioGroup, props);
};

const makeSelect = async (
  repositories: RepositoryMap,
  { title, data }: RawSelect,
): Promise<React.ComponentType<CSelectProps>> => {
  const props = await repositories[data.entity].getList().then(options => ({
    options: options.map(option => ({
      value: option[data.value],
      label: option[data.label],
      icon: option[data.icon],
    })),
    title,
  }));
  return withProps(CSelect, props);
};

const makeCheckbox = async ({
  label,
  title,
}: RawCheckbox): Promise<React.ComponentType<FieldInputProps<any>>> => {
  return props => {
    return <CCheckbox {...props} title={title} label={label} />;
  };
};

const isFieldInputControl = (control: string) =>
  ["input", "select", "radioGroup", "checkbox"].indexOf(control) !== -1;

const withBindValue = (
  { bind }: RawFieldInputControl,
  component: React.ComponentType<FieldInputProps<any>>,
): React.ComponentType => {
  const { entity, path } = parseVariable(bind);
  return () => {
    const history = useHistory();
    let initialValue: any;
    let handleChange: React.ChangeEventHandler<{ value: any }> = (
      _: React.ChangeEvent<{ value: any }>,
    ) => {};
    if (entity === "query") {
      initialValue = _.get(Query.parse(history.location.search), path);
      handleChange = (event: React.ChangeEvent<{ value: any }>) => {
        goToSearch(history, search => {
          const query = Query.parse(search);
          console.log(search);
          console.log(query);
          console.log(path);
          console.log(event.target.value);
          return Query.stringify(_.set(query, path, event.target.value));
        });
      };
    }
    return React.createElement(component, {
      value: initialValue,
      onChange: handleChange,
      name: "",
      onBlur: () => {},
    });
  };
};
const makeDiv = async (
  repositories: RepositoryMap,
  { children }: RawDiv,
): Promise<React.ComponentType> => {
  const list = _.isArray(children)
    ? (children as RawControl[])
    : [children as RawControl];

  const wrapControl = async (rawControl: RawControl) => {
    let component = await makeComponent(repositories, rawControl);
    if (isFieldInputControl(rawControl.control)) {
      component = withBindValue(
        rawControl as RawFieldInputControl,
        component as React.ComponentType<FieldInputProps<any>>,
      );
    }
    return component;
  };
  const childrenComponents = await Promise.all(list.map(wrapControl));
  return () => <div>{childrenComponents.map(React.createElement)}</div>;
};

const makeFormControl = (
  repositories: RepositoryMap,
  ctrl: RawControl,
): Promise<React.ComponentType<any>> => {
  if (ctrl.control === "form") {
    throw new Error("Nested form not allowed");
  }

  return makeComponent(repositories, ctrl);
};

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
  ctrl: RawControl,
): Promise<React.ComponentType<any>> => {
  switch (ctrl.control) {
    case "div":
      return makeDiv(repositories, ctrl as RawDiv);
    case "form":
      return makeForm(repositories, ctrl as RawForm);
    case "input":
      return makeInput(ctrl as RawInput);
    case "radioGroup":
      return makeRadioGroup(repositories, ctrl as RawRadioGroup);
    case "checkbox":
      return makeCheckbox(ctrl as RawCheckbox);
    case "select":
      return makeSelect(repositories, ctrl as RawSelect);
    default:
      throw new Error(`Unsupport control: ${ctrl.control}`);
  }
};

const makePageComponentHelper = async (
  configUrl: string,
): Promise<React.ComponentType> => {
  //  1. get config file
  //  2. create react component according to the config file
  //    - Get initial values from remote server in this step
  //  3. return the component, the caller decide when to render the component
  const { entities, ui, title } = await fetchJson(configUrl, "GET");
  const repositories = toRepositoryMap(entities);
  const Body = await makeComponent(repositories, ui);
  return () => (
    <RepositoryMapContext.Provider value={repositories}>
      <CPage title={title}>
        <Body />
      </CPage>
    </RepositoryMapContext.Provider>
  );
};

export const makePageComponent = async (
  configUrl: string,
): Promise<React.ComponentType> => {
  try {
    return await makePageComponentHelper(configUrl);
  } catch (error) {
    // initialize error, show error message and reload button
    return () => {
      const handleReload = async () => {
        const component = await makePageComponentHelper(configUrl);
        setEle(React.createElement(component));
      };

      const [ele, setEle] = React.useState(() => (
        <LoadError error={error} onReload={handleReload} />
      ));

      return ele;
    };
  }
};
