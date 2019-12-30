import { CFormField } from "../Form";
import _ from "lodash";
import { RawProduct } from "../../Pages";

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
  default?: any;
}

export interface UIEntity {
  name: string;
  fields: UIEntityField[];
}

export interface GlobalSettings {
  endPointPrefix: string;
  dateTimeFormat: string;
  menu: Array<RawProduct>;
}

// structure: page include groups, each group include rows, each row is a control
export interface RawUIPage {
  title: string;
  description?: string;
  entity: UIEntity;
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
  codeLanguage?: string;
}

type ComponentType =
  | "input"
  | "select"
  | "radioGroup"
  | "checkbox"
  | "codeEditor"
  // TODO:
  | "label"
  | "labelWithToggle";

export interface UIRow {
  field: UIEntityField;
  componentType: ComponentType;
  indent: 0 | 1;
  conditionsToHide?: string[];
}
export interface UIRowCodeEditor extends UIRow {
  codeLanguage: string;
}

const normalizeRawUIRow = (
  fields: UIEntityField[],
  {
    indent,
    conditionsToHide,
    componentType,
    fieldName,
    codeLanguage,
  }: RawUIRow,
): UIRow => {
  const row: UIRow = {
    componentType,
    indent: indent || 0,
    conditionsToHide,
    field: fields.find(({ name }) => name === fieldName)!,
  };
  if (componentType === "codeEditor") {
    return { ...row, codeLanguage } as UIRowCodeEditor;
  }
  return row;
};

export const normalizeRawUIPage = (
  settings: GlobalSettings,
  { title, description, entity, rows, grid }: RawUIPage,
  isNew = false,
): UIPage => {
  const defaultValues = entity.fields.reduce(
    (res, field) => {
      return {
        ...res,
        [field.name]: field.default,
      };
    },
    { id: "" },
  );
  return {
    type: rows ? (isNew ? "singularNew" : "singular") : "list",
    settings,
    title,
    description,
    entity,
    rows: rows?.map(row => normalizeRawUIRow(entity.fields, row)),
    grid,
    defaultValues,
  };
};

export interface UIPage {
  type: "singular" | "singularNew" | "list";
  settings: GlobalSettings;
  title: string;
  description?: string;
  entity: UIEntity;
  rows?: UIRow[];
  grid?: UIGrid;
  defaultValues: Entity;
}

export type Entity = { id: string | number | undefined; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
}

export type CustomComponent = () => Promise<React.ComponentType>;

export type CustomFormFieldComponent = () => Promise<CFormField<Entity>>;
