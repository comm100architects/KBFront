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
import Page from "./Page";
import { CRadioGroup, CRadioGroupProps } from "./RadioGroup";
import { CCheckbox } from "./Checkbox";
import { CSelect, CSelectProps } from "./Select";
import { fetchJson } from "../framework/network";
import { withLazyProps } from "../framework/hoc";

export type Entity = { id: string; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
  repository?: IRepository<Entity>;
}

export type EntityInfoMap = { [name: string]: EntityInfo };

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
  title: string;
  children: RawFormControl[];
  dataSource: string;
}

export interface RawPage {
  entities: EntityInfo[];
  ui: RawControl;
}

const makeForm = (
  entities: EntityInfoMap,
  { dataSource, children, title }: RawForm,
): React.ComponentType => {
  const repo = entities[dataSource].repository!;
  return () => {
    const fields = children.map(child => ({
      title: child.title,
      required: child.required,
      as: makeFormControl(entities, child),
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
      <Page title={title}>
        {values && (
          <CForm initialValues={values!} fields={fields} onSave={handleSave} />
        )}
      </Page>
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
  entities: EntityInfoMap,
  { title, dataSource }: RawRadioGroup,
): React.ComponentType<CRadioGroupProps> =>
  withLazyProps(
    CRadioGroup,
    entities[dataSource].repository!.getList().then(options => ({
      options: options.map(({ id, label }) => ({
        value: id,
        text: label,
      })),
      title,
    })),
  );

const makeSelect = (
  entities: EntityInfoMap,
  { title, dataSource }: RawSelect,
): React.ComponentType<CSelectProps> =>
  withLazyProps(
    CSelect,
    entities[dataSource].repository!.getList().then(options => ({
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
  entities: EntityInfoMap,
  ctrl: RawControl,
): React.ComponentType<any> => {
  switch (ctrl.control) {
    case "input":
      return makeInput(ctrl as RawInput);
    case "radioGroup":
      return makeRadioGroup(entities, ctrl as RawRadioGroup);
    case "checkbox":
      return makeCheckbox(ctrl as RawCheckbox);
    case "select":
      return makeSelect(entities, ctrl as RawSelect);
    default:
      return () => <></>;
  }
};

const makeComponent = (
  entities: EntityInfoMap,
  ctrl: RawControl,
): React.ComponentType => {
  if (ctrl.control === "form") {
    return makeForm(entities, ctrl as RawForm);
  }
  return () => <></>;
};

const createEntityRepository = (entities: EntityInfo[]): EntityInfoMap => {
  const list = entities.map(info => {
    if (typeof info.source === "string") {
      return {
        ...info,
        repository: new RESTfulRepository(
          info.source,
          info.name,
        ) as IRepository<Entity>,
      };
    }
    if (_.isArray(info.source)) {
      return {
        ...info,
        repository: new ReadonlyLocalRepository(
          info.source as Entity[],
        ) as IRepository<Entity>,
      };
    }
    return {
      ...info,
      repository: new ReadonlyLocalRepository([
        info.source as Entity,
      ]) as IRepository<Entity>,
    };
  });

  return list.reduce((res: EntityInfoMap, info: EntityInfo) => {
    res[info.name] = info;
    return res;
  }, {});
};

const RootComponent = ({
  entities,
  ui,
}: {
  entities: EntityInfoMap;
  ui: RawControl;
}) => React.createElement(makeComponent(entities, ui));

export const makePageComponent = (configUrl: string): React.ComponentType =>
  withLazyProps(
    RootComponent,
    fetchJson(configUrl, "GET").then(({ entities, ui }) => ({
      entities: createEntityRepository(entities),
      ui,
    })),
  ) as React.ComponentType;
