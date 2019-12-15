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

export const RepositoryMapContext = React.createContext(
  {} as { [name: string]: IRepository<Entity> },
);

export type RepositoryMap = { [name: string]: IRepository<Entity> };

export type Entity = { id: string; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
  repository?: IRepository<Entity>;
}

export interface RawControl {
  control: "form" | "input" | "radioGroup" | "checkbox" | "select";
}

export interface RawInput extends RawControl {
  title: string;
  type: "text" | "url" | "number" | "email";
}

export interface RawSelect extends RawControl {
  title: string;
  dataSource: string;
}

export interface RawRadioGroup extends RawControl {
  title: string;
  dataSource: string;
}

export interface RawCheckbox extends RawControl {
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
  dataSource: string;
}

export interface RawPage {
  title: string;
  entities: EntityInfo[];
  ui: RawControl;
}

const makeForm = ({ dataSource, children }: RawForm): React.ComponentType => {
  return () => {
    const repositories = React.useContext(RepositoryMapContext);
    const repo = repositories[dataSource];
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
    const [values, setValues] = React.useState(undefined as Entity | undefined);
    React.useEffect(() => {
      repo.get().then(setValues);
    }, []);
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
  { title, dataSource }: RawRadioGroup,
): React.ComponentType<CRadioGroupProps> =>
  withLazyProps(
    CRadioGroup,
    repositories[dataSource].getList().then(options => ({
      options: options.map(({ id, label }) => ({
        value: id,
        text: label,
      })),
      title,
    })),
  );

const makeSelect = (
  repositories: RepositoryMap,
  { title, dataSource }: RawSelect,
): React.ComponentType<CSelectProps> =>
  withLazyProps(
    CSelect,
    repositories[dataSource].getList().then(options => ({
      options: options.map(({ id, label, icon }) => ({
        value: id,
        text: label,
        icon: icon,
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

const makeFormControl = (
  repositories: RepositoryMap,
  ctrl: RawControl,
): React.ComponentType<any> => {
  switch (ctrl.control) {
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

const PageComponent = ({
  repositories,
  ctrl,
  title,
}: {
  repositories: RepositoryMap;
  ctrl: RawControl;
  title: string;
}) => {
  let component: React.ComponentType = () => <></>;
  if (ctrl.control === "form") {
    component = makeForm(ctrl as RawForm);
  }
  return (
    <RepositoryMapContext.Provider value={repositories}>
      <CPage title={title}>{React.createElement(component)}</CPage>
    </RepositoryMapContext.Provider>
  );
};

export const makePageComponent = (configUrl: string): React.ComponentType =>
  withLazyProps(
    PageComponent,
    fetchJson(configUrl, "GET").then(({ entities, ui, title }) => ({
      repositories: toRepositoryMap(entities),
      ctrl: ui,
      title,
    })),
  ) as React.ComponentType;
