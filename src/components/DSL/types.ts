import { CFormField } from "../Form";
import { IRepository, RESTfulRepository } from "../../framework/repository";
import { CIconName } from "../Icons";
import _ from "lodash";

export interface UIEntityFieldLabelForValue {
  key: number | boolean;
  label: string;
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
    | "selfIncrementId";
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

// structure: page include groups, each group include rows, each row is a control
export interface RawUIPage {
  endPointPrefix: string;
  title: string;
  entities: RawUIEntity[];
  entity: string;
  rows: RawUIRow[];
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
  entity,
  entities,
  endPointPrefix,
  rows,
}: RawUIPage): UIPage => {
  const fields = entities.find(({ name }) => name === entity)?.fields ?? [];
  return {
    endPointPrefix,
    title,
    entity,
    rows: rows.map(row => normalizeRawUIRow(fields, row)),
    repositories: toRepositoryMap(endPointPrefix, entities),
    fields,
  };
};

export type RepositoryMap = { [name: string]: IRepository<Entity> };

export interface UIPage {
  endPointPrefix: string;
  title: string;
  repositories: RepositoryMap;
  fields: UIEntityField[];
  rows: UIRow[];
  entity: string;
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
