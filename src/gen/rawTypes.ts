import _ from "lodash";
import { CIconName } from "../components/Icons";

export type UIAction = "new" | "update" | "view";

export type ComponentType =
  | "input"
  | "select"
  | "radioGroup"
  | "checkbox"
  | "codeEditor"
  // TODO:
  | "label"
  | "labelWithToggle";

export interface RawEntity {
  name: string;
  nameForPlural: string;
  label: string;
  labelForPlural: string;
  description?: string;
  fields: RawEntityField[];
  grid?: RawUIGrid;
  form?: RawUIForm;
  fieldToBeDisplayedWhenReferenced: string;
  isSingleRecord: boolean;
  selector?: string;
  parentSelector?: RawUISelector;
  grandparentSelector?: RawUISelector;
}

export interface RawUISelector {
  fieldName: string;
  componentType: "select" | "tree";
  componentPosition: "topRightCorner" | "left";
}

export interface EnumItem {
  key: number | boolean;
  label: string;
  icon?: CIconName;
}

export interface RawEntityField {
  isPrimary: boolean;
  name: string;
  label: string;
  type: string;
  minLength?: number;
  maxLength?: number;
  isRequired?: boolean;
  labelsForValue?: EnumItem[];
  isVisibleForNew: boolean;
  isVisibleForEdit: boolean;
  referenceEntityName?: string;
  default?: any;
}

export interface RawUIGridColumn {
  fieldName: string;
  headerIcon?: CIconName;
  isAllowSort: boolean;
  isIcon: boolean;
  link?: string;
  width?: string;
}

export interface RawUIGrid {
  columns: RawUIGridColumn[];
  isAllowNew: boolean;
  isAllowEdit: boolean;
  isAllowDelete: boolean;
  filters: RawUIGridFilter[];
}

export interface RawUIGridFilter {
  fieldName?: string;
  componentType: "select" | "keywordSearch";
}

export interface RawUIForm {
  rows: RawUIRow[];
  isDiscardOrCancel: boolean;
}

export interface RawUIRow {
  fieldName: string;
  componentType: ComponentType;
  indent?: 0 | 1;
  conditionForShowing?: string[];
  conditionLogic: "and" | "or";
}

export interface RawTopMenu {
  label: string;
  menu: RawSideMenu[];
}

export interface RawSideMenu {
  label: string;
  icon: CIconName;
  entityName: string;
  isMultiRowsUI: boolean;
  actionForSingleRow: UIAction;
  parentMenuLabel?: string;
}

export interface RawGlobalSettings {
  endPointPrefix: string;
  dateTimeFormat: string;
  poweredByHtml: string;
}

