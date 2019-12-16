import * as React from "react";
import _ from "lodash";
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
import { useHistory } from "react-router";
import { History } from "History";
import * as Query from "query-string";
import { CIconName } from "./Icons";
import { goToSearch } from "../framework/locationHelper";
import LoadError from "../components/LoadError";
import { changeHandler } from "../framework/utils";
import setIn from "lodash/fp/set";

const GlobalContext = React.createContext(
  {} as { [key: string]: IGlobalVariable },
);

const parseVariable = (variable: string) => {
  const i = variable.indexOf(".");
  if (i > 0) {
    return {
      name: variable.substring(0, i),
      path: variable.substring(i + 1),
    };
  }
  throw new Error(`parseVariable error: ${variable}`);
};

const useGlobal = (variable: string) => {
  const { name, path } = parseVariable(variable);
  const res = React.useContext(GlobalContext)[name];
  if (!res)
    throw new Error(
      `No global variable: ${name}. Only "query" and "state" are supported right now.`,
    );
  return [res.getValue(path), (val: any) => res.setValue(path, val)];
};

export type RepositoryMap = { [name: string]: IRepository<Entity> };

export type Entity = { id: string; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
}

export type CustomComponent = (
  repositories: RepositoryMap,
) => Promise<React.ComponentType>;

export interface RawControl {
  control: "div" | "form" | "input" | "radioGroup" | "checkbox" | "select";
}

export interface RawDiv extends RawControl {
  // allow inject custom component
  children: (RawControl | CustomComponent) | (RawControl | CustomComponent)[];
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

const getFormInitialValues = async (
  repo: IRepository<Entity>,
  variable: string,
): Promise<Entity> => {
  const { name, path } = parseVariable(variable);
  if (name === "query") {
    const query = Query.parse(window.location.search);
    const kbId = _.get(query, path) as string;
    return await repo.get(kbId);
  }
  return await repo.get();
};

const makeForm = async (
  repositories: RepositoryMap,
  { data, children }: RawForm,
): Promise<React.ComponentType> => {
  const repo = repositories[data.entity];
  const initialValues = await getFormInitialValues(repo, data.id);
  const fields = await Promise.all(
    children.map(async child => ({
      title: child.title,
      required: child.required,
      as: await makeFormControl(repositories, child),
      name: child.name,
    })),
  );

  return () => {
    const handleSave = async (values: Entity) => {
      setValues(await repo.update(values.id, values));
      return;
    };

    const [values, setValues] = React.useState(initialValues);

    const [kbId] = useGlobal(data.id);

    React.useEffect(() => {
      repo.get(kbId).then(setValues);
    }, [kbId]);

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

const isFieldInputControl = (ctrl: RawControl | CustomComponent) => {
  if ((ctrl as RawControl).control) {
    return (
      ["input", "select", "radioGroup", "checkbox"].indexOf(
        (ctrl as RawControl).control,
      ) !== -1
    );
  }
  return false;
};

const withBindValue = (
  { bind }: RawFieldInputControl,
  component: React.ComponentType<FieldInputProps<any>>,
): React.ComponentType => {
  return () => {
    const [value, setValue] = useGlobal(bind);
    return React.createElement(component, {
      value,
      onChange: changeHandler(setValue),
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
    ? (children as (RawControl | CustomComponent)[])
    : [children as RawControl | CustomComponent];

  const makeChild = async (child: RawControl | CustomComponent) => {
    let component = await makeComponent(repositories, child);
    if (isFieldInputControl(child)) {
      component = withBindValue(
        child as RawFieldInputControl,
        component as React.ComponentType<FieldInputProps<any>>,
      );
    }
    return component;
  };
  const childrenComponents = await Promise.all(list.map(makeChild));
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
  ctrl: RawControl | CustomComponent,
): Promise<React.ComponentType<any>> => {
  if (typeof ctrl === "function") {
    return (ctrl as CustomComponent)(repositories);
  }

  const control = (ctrl as RawControl).control;

  switch (control) {
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
      throw new Error(`Unsupport control: ${control}`);
  }
};

interface IGlobalVariable {
  getValue(path: string): any;
  setValue(path: string, val: any): void;
}

class GlobalQueryString implements IGlobalVariable {
  private history: History;
  private query: Query.ParsedQuery;

  constructor(history: History) {
    this.history = history;
    this.query = Query.parse(history.location.search);
  }

  getValue(path: string) {
    return _.get(this.query, path);
  }

  setValue(path: string, val: any): void {
    const newQuery = setIn(path, val, this.query);
    console.log("setValue", path, val, this.query, newQuery);
    if (_.isEqual(this.query, newQuery)) {
      return;
    } else {
      this.query = newQuery;
      goToSearch(this.history, () => Query.stringify(this.query));
    }
  }
}

class GlobalState implements IGlobalVariable {
  private state: any;
  private setState: (s: any) => void;
  constructor(state: any, setState: (s: any) => void) {
    this.state = state;
    this.setState = setState;
  }

  getValue(path: string) {
    return _.get(this.state, path);
  }
  setValue(path: string, val: any): void {
    this.state = setIn(path, val, this.state);
    this.setState(this.state);
  }
}

const makePageComponentHelper = async (
  configUrl: string,
  injecter: (ui: RawControl) => RawControl,
): Promise<React.ComponentType> => {
  //  1. get config file
  //  2. create react component according to the config file
  //    - Get initial values from remote server in this step
  //  3. return the component, the caller decide when to render the component
  const { entities, ui, title } = await fetchJson(configUrl, "GET");
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
