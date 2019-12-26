import { CFormField } from "../Form";
import _ from "lodash";
import { fetchJson } from "../../framework/network";

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

export interface UIEntity {
  name: string;
  fields: UIEntityField[];
}

export interface GlobalSettings {
  endPointPrefix: string;
  dateTimeFormat: string;
}

// structure: page include groups, each group include rows, each row is a control
export interface RawUIPage {
  title: string;
  description?: string;
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

const normalizeRawUIRow = (
  fields: UIEntityField[],
  { indent, conditionsToHide, componentType, fieldName }: RawUIRow,
): UIRow => ({
  componentType,
  indent: indent || 0,
  conditionsToHide,
  field: fields.find(({ name }) => name === fieldName)!,
});

export const normalizeRawUIPage = async (
  settings: GlobalSettings,
  { title, description, entity, rows, grid }: RawUIPage,
): Promise<UIPage> => {
  const { endPointPrefix } = settings;
  const e = await fetchJson(`${endPointPrefix}/entities/${entity}`, "GET");
  return {
    settings,
    title,
    description,
    entity: e,
    rows: rows?.map(row => normalizeRawUIRow(e.fields, row)),
    grid,
  };
};

export interface UIPage {
  settings: GlobalSettings;
  title: string;
  description?: string;
  entity: UIEntity;
  rows?: UIRow[];
  grid?: UIGrid;
}

export type Entity = { id: string | number; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
}

export type CustomComponent = () => Promise<React.ComponentType>;

export type CustomFormFieldComponent = () => Promise<CFormField<Entity>>;
