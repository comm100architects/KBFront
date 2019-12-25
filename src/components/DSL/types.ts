import { CFormField } from "../Form";
import { IRepository, RESTfulRepository } from "../../framework/repository";
import _ from "lodash";

export interface UIEntityFieldLabelForValue {
  key: number | boolean;
  label: string;
  icon?: string;
}
export interface UIEntityField {
  name: string;
  type:
    | "string"
    | "int"
    | "enum"
    | "reference"
    | "bool"
    | "reference"
    | "guid"
    | "selfIncrementId"
    | "dateTime";
  minLength?: number;
  maxLength?: number;
  isRequired?: boolean;
  title?: string;
  labelsForValue?: UIEntityFieldLabelForValue[];
  fields?: UIEntityField[];
  referenceEntityName?: string;
  referenceEntityFieldNameForLabel?: string;
}

export interface RawUIEntity {
  name: string;
  fields: UIEntityField[];
}

export interface GlobalSettings {
  endPointPrefix: string;
  dateTimeFormat: string;
}

// structure: page include groups, each group include rows, each row is a control
export interface RawUIPage {
  settings: GlobalSettings;
  title: string;
  description?: string;
  entities: RawUIEntity[];
  entity: string;
  rows?: RawUIRow[];
  grid?: UIGrid;
}

export interface UIGrid {
  columns: UIGridColumn[];
  isAllowNew: boolean;
  newEntityButtonLabel: string;
  isAllowEdit: boolean;
  isAllowDelete: boolean;
  confirmDeleteMessage?: string;
}

export interface UIGridColumn {
  headerLabel?: string;
  isAllowSort?: boolean;
  fieldName: string;
  cellComponentType: "link" | "text" | "icon";
  linkPath?: string;
  width?: string;
}

export interface RawUIRow {
  fieldName: string;
  componentType: ComponentType;
  indent?: 0 | 1;
  conditionsToHide?: string[];
}

type ComponentType =
  | "input"
  | "select"
  | "radioGroup"
  | "checkbox"
  | "label"
  | "labelWithToggle";

export interface UIRow {
  field: UIEntityField;
  componentType: ComponentType;
  indent: 0 | 1;
  conditionsToHide?: string[];
}

export type UIEntityMap = { [name: string]: RawUIEntity };

const toRepositoryMap = (
  endPointPrefix: string,
  entities: RawUIEntity[],
): RepositoryMap => {
  const list = entities.map(({ name }) => {
    return {
      name,
      repository: new RESTfulRepository(endPointPrefix, name) as IRepository<
        Entity
      >,
    };
  });

  return list.reduce((res, { name, repository }) => {
    res[name] = repository;
    return res;
  }, {} as RepositoryMap);
};

const normalizeRawUIRow = (
  fields: UIEntityField[],
  { indent, conditionsToHide, componentType, fieldName }: RawUIRow,
): UIRow => ({
  componentType,
  indent: indent || 0,
  conditionsToHide,
  field: fields.find(({ name }) => name === fieldName)!,
});

export const normalizeRawUIPage = ({
  title,
  description,
  entity,
  entities,
  settings,
  rows,
  grid,
}: RawUIPage): UIPage => {
  const fields = entities.find(({ name }) => name === entity)?.fields ?? [];
  return {
    settings,
    title,
    description,
    entity,
    rows: rows?.map(row => normalizeRawUIRow(fields, row)),
    repositories: toRepositoryMap(settings.endPointPrefix, entities),
    fields,
    grid,
  };
};

export type RepositoryMap = { [name: string]: IRepository<Entity> };

export interface UIPage {
  settings: GlobalSettings;
  title: string;
  description?: string;
  repositories: RepositoryMap;
  fields: UIEntityField[];
  entity: string;
  rows?: UIRow[];
  grid?: UIGrid;
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

