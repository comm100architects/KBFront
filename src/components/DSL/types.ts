import { CFormField } from "../Form";
import {
  IRepository,
  ReadonlyLocalRepository,
  RESTfulRepository,
} from "../../framework/repository";
import { CIconName } from "../Icons";
import _ from "lodash";

export type UIEntityFieldType =
  | {
      name: "string";
      minLength?: number;
      maxLength?: number;
    }
  | { name: "reference"; entityName: string; labelFieldName?: string }
  | { name: "bool" }
  | { name: "int"; min: number; max: number }
  | { name: "guid" };

export interface UIEntityField {
  name: string;
  type: UIEntityFieldType;
  isRequired?: boolean;
  title?: string;
}

export interface RawUIEntity {
  name: string;
  type: "object" | "enum";
  fields?: UIEntityField[];
  data: string | Entity[];
}

// structure: page include groups, each group include rows, each row is a control
export interface RawUIPage {
  title: string;
  entities: RawUIEntity[];
  entity: string;
  groups: RawUIGroup[];
}

export interface RawUIGroup {
  indent: 0 | 1;
  conditionsToHide?: string[];
  rows: RawUIRow[];
}

export interface RawUIRow {
  fieldName: string;
  componentType: ComponentType;
  nullOptionLabel?: string;
  label?: string;
}

type ComponentType = "input" | "select" | "radioGroup" | "checkbox";

export interface UIRow {
  field: UIEntityField;
  componentType: ComponentType;
}

export interface UIRowCheckbox extends UIRow {
  label: string;
}

export interface UIRowSelect extends UIRow {
  nullOptionLabel?: string;
  optionsEntity: string;
  optionsLabelField?: string;
}

export interface UIRowRadioGroup extends UIRow {
  optionsEntity: string;
  optionsLabelField?: string;
}

export type UIEntityMap = { [name: string]: RawUIEntity };

const toRepositoryMap = (entities: RawUIEntity[]): RepositoryMap => {
  const list = entities.map(info => {
    if (typeof info.data === "string") {
      return {
        name: info.name,
        repository: new RESTfulRepository(info.data) as IRepository<Entity>,
      };
    }
    if (_.isArray(info.data)) {
      return {
        name: info.name,
        repository: new ReadonlyLocalRepository(
          info.data as Entity[],
        ) as IRepository<Entity>,
      };
    }
    return {
      name: info.name,
      repository: new ReadonlyLocalRepository([
        info.data as Entity,
      ]) as IRepository<Entity>,
    };
  });

  return list.reduce((res, { name, repository }) => {
    res[name] = repository;
    return res;
  }, {} as RepositoryMap);
};

export const normalizeRawUIGroup = (
  fields: UIEntityField[],
  group: RawUIGroup,
): UIGroup => {
  return {
    indent: group.indent,
    conditionsToHide: group.conditionsToHide,
    rows: group.rows.map((row: RawUIRow) => {
      if (row.componentType === "radioGroup" || row.componentType === "input") {
        return {
          componentType: row.componentType,
          field: fields.find(({ name }) => name === row.fieldName)!,
        };
      } else if (row.componentType === "select") {
        return {
          componentType: row.componentType,
          field: fields.find(({ name }) => name === row.fieldName)!,
          nullOptionLabel: row.nullOptionLabel,
        };
      } else if (row.componentType === "checkbox") {
        return {
          componentType: row.componentType,
          field: fields.find(({ name }) => name === row.fieldName)!,
          label: row.label,
        };
      }

      throw new Error(`unknown componentType: ${row.componentType}`);
    }),
  };
};

export const normalizeRawUIPage = ({
  title,
  entity,
  entities,
  groups,
}: RawUIPage): UIPage => {
  const fields = entities.find(({ name }) => name === entity)?.fields ?? [];
  return {
    title,
    entity,
    groups: groups.map(g => normalizeRawUIGroup(fields, g)),
    repositories: toRepositoryMap(entities),
    fields,
  };
};

export type RepositoryMap = { [name: string]: IRepository<Entity> };

export interface UIPage {
  title: string;
  repositories: RepositoryMap;
  fields: UIEntityField[];
  groups: UIGroup[];
  entity: string;
}

export interface UIGroup {
  indent: number;
  conditionsToHide?: string[];
  title?: string;
  rows: UIRow[];
}

export type Entity = { id: string | number; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
}

export type CustomComponent = (
  repositories: RepositoryMap,
) => Promise<React.ComponentType>;

export type CustomFormFieldComponent = (
  repositories: RepositoryMap,
) => Promise<CFormField<Entity>>;

// to be deleted
export interface RawControl {
  control: "div" | "form" | "input" | "radioGroup" | "checkbox" | "select";
  className?: string;
}

export interface RawDiv extends RawControl {
  // allow inject custom component
  children: (RawControl | CustomComponent) | (RawControl | CustomComponent)[];
}

export interface RawFieldInputControl extends RawControl {
  value: string;
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
  children: (RawFormControl | CustomFormFieldComponent)[];
  data: { entity: string; id: string };
}

export interface RawPage {
  title: string;
  entities: EntityInfo[];
  ui: RawControl;
}
