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
import { withLazyProps } from "../framework/hoc";
import { useLocation, useHistory } from "react-router";
import * as Query from "query-string";
import { CIconName } from "./Icons";
import { goToSearch } from "../framework/locationHelper";

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

const makeForm = ({ data, children }: RawForm): React.ComponentType => {
  return () => {
    const repositories = React.useContext(RepositoryMapContext);
    const repo = repositories[data.entity];
    const fields = children.map(child => ({
      title: child.title,
      required: child.required,
      as: makeFormControl(repositories, child),
      name: child.name,
    }));
    const handleSave = async (values: Entity) => {
      setValues(await repo.update(values.id, values));
      return;
    };
    const location = useLocation();

    const [values, setValues] = React.useState(undefined as Entity | undefined);

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

const makeInput = ({
  title,
  type,
}: RawInput): React.ComponentType<FieldInputProps<any>> => {
  return props => <CInput {...props} label={title} type={type} />;
};

const makeRadioGroup = (
  repositories: RepositoryMap,
  { title, data }: RawRadioGroup,
): React.ComponentType<CRadioGroupProps> =>
  withLazyProps(
    CRadioGroup,
    repositories[data.entity].getList().then(options => ({
      options: options.map(option => ({
        value: option[data.value],
        label: option[data.label],
      })),
      title,
    })),
  );

const makeSelect = (
  repositories: RepositoryMap,
  { title, data }: RawSelect,
): React.ComponentType<CSelectProps> =>
  withLazyProps(
    CSelect,
    repositories[data.entity].getList().then(options => ({
      options: options.map(option => ({
        value: option[data.value],
        label: option[data.label],
        icon: option[data.icon],
      })),
      title,
    })),
  );

const makeCheckbox = ({
  label,
  title,
}: RawCheckbox): React.ComponentType<FieldInputProps<any>> => {
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
    console.log(history.location.search);
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
const makeDiv = (
  repositories: RepositoryMap,
  { children }: RawDiv,
): React.ComponentType => {
  const list = _.isArray(children)
    ? (children as RawControl[])
    : [children as RawControl];

  const wrapControl = (rawControl: RawControl) => {
    let component = makeComponent(repositories, rawControl);
    if (isFieldInputControl(rawControl.control)) {
      component = withBindValue(
        rawControl as RawFieldInputControl,
        component as React.ComponentType<FieldInputProps<any>>,
      );
    }
    return component;
  };
  return () => (
    <div>{list.map(child => React.createElement(wrapControl(child)))}</div>
  );
};

const makeFormControl = (
  repositories: RepositoryMap,
  ctrl: RawControl,
): React.ComponentType<any> => {
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
): React.ComponentType<any> => {
  switch (ctrl.control) {
    case "div":
      return makeDiv(repositories, ctrl as RawDiv);
    case "form":
      return makeForm(ctrl as RawForm);
    case "input":
      return makeInput(ctrl as RawInput);
    case "radioGroup":
      return makeRadioGroup(repositories, ctrl as RawRadioGroup);
    case "checkbox":
      return makeCheckbox(ctrl as RawCheckbox);
    case "select":
      return makeSelect(repositories, ctrl as RawSelect);
    default:
      return () => <></>;
  }
};

const PageComponent = ({
  repositories,
  ctrl,
  title,
}: {
  repositories: RepositoryMap;
  ctrl: RawControl;
  title: string;
}) => (
  <RepositoryMapContext.Provider value={repositories}>
    <CPage title={title}>
      {React.createElement(makeComponent(repositories, ctrl))}
    </CPage>
  </RepositoryMapContext.Provider>
);

export const makePageComponent = (configUrl: string): React.ComponentType =>
  withLazyProps(
    PageComponent,
    fetchJson(configUrl, "GET").then(({ entities, ui, title }) => ({
      repositories: toRepositoryMap(entities),
      ctrl: ui,
      title,
    })),
  ) as React.ComponentType;
