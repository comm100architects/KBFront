import _ from "lodash";
import { IRepository, RESTfulRepository } from "../framework/repository";
import { CIconName } from "../components/Icons";

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
  referenceEntityName?: string;
  referenceEntityFieldNameForLabel?: string;
  referenceRepo?: IRepository<Entity>;
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

export interface UIGridFilter {
  fieldName?: string;
  componentType: "select" | "keywordSearch";
}

// structure: page include groups, each group include rows, each row is a control
export interface RawUIPage {
  title: string;
  description?: string;
  entity: UIEntity;
  rows?: RawUIRow[];
  grid?: UIGrid;
  parentEntities?: RawParentEntity[];
}

export interface UIGrid {
  columns: UIGridColumn[];
  isAllowNew: boolean;
  newEntityButtonLabel: string;
  isAllowEdit: boolean;
  isAllowDelete: boolean;
  confirmDeleteMessage?: string;
  filters: UIGridFilter[];
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

const normalizeRawUIRow = (
  fields: UIEntityField[],
  { indent, conditionsToHide, componentType, fieldName }: RawUIRow,
): UIRow => {
  const row: UIRow = {
    componentType,
    indent: indent || 0,
    conditionsToHide,
    field: fields.find(({ name }) => name === fieldName)!,
  };
  if (componentType === "codeEditor") {
    return { ...row };
  }
  return row;
};

export const normalizeRawUIPage = (
  settings: GlobalSettings,
  { title, description, entity, rows, grid, parentEntities }: RawUIPage,
  relatviePath = "",
): UIPage => {
  const entityFields = entity.fields.map(field => ({
    ...field,
    referenceRepo: field.referenceEntityName
      ? new RESTfulRepository<Entity>(
          settings.endPointPrefix,
          field.referenceEntityName,
        )
      : undefined,
  }));
  const defaultValues = entityFields.reduce(
    (res, field) => {
      return {
        ...res,
        [field.name]: field.default,
      };
    },
    { id: "" },
  );
  return {
    type: rows ? (relatviePath === "new" ? "singularNew" : "singular") : "list",
    settings,
    title,
    description,
    entity: { ...entity, fields: entityFields },
    entityRepo: new RESTfulRepository<Entity>(
      settings.endPointPrefix,
      entity.name,
    ),
    rows: rows?.map(row => normalizeRawUIRow(entityFields, row)),
    grid,
    defaultValues,
    isDedicatedSingular: relatviePath === "",
    parentEntities:
      parentEntities?.map(e => ({
        ...e,
        repo: new RESTfulRepository<Entity>(settings.endPointPrefix, e.name),
        data: [],
      })) || [],
  };
};

interface RawParentEntity {
  name: string;
  fieldName: string;
  position: "topRightCorner" | "left";
}

interface ParentEntity {
  name: string;
  fieldName: string;
  position: "topRightCorner" | "left";
  repo: IRepository<Entity>;
  data: Entity[];
}

export interface UIPage {
  type: "singular" | "singularNew" | "list";
  parentEntities: ParentEntity[];
  isDedicatedSingular: boolean;
  settings: GlobalSettings;
  title: string;
  description?: string;
  entity: UIEntity;
  entityRepo: IRepository<Entity>;
  rows?: UIRow[];
  grid?: UIGrid;
  defaultValues: Entity;
}

export type Entity = { id: string | number | undefined; [key: string]: any };

export interface EntityInfo {
  name: string;
  source: string | Entity | Entity[];
}

export interface PageRef {
  relatviePath: string;
  pageId: string;
  redirectTo?: string;
}

export interface RawMenuItem {
  name: string; // for url
  label: string; //
  icon?: CIconName;
  pages?: PageRef[];
}

export interface RawSubMenu {
  label: string;
  icon: CIconName;
  items: Array<RawMenuItem>;
  pages?: PageRef[];
}

export type RawMenu = Array<RawMenuItem | RawSubMenu>;

export interface RawProduct {
  name: string;
  label: string;
  defaultPage: string;
  menu: RawMenu;
}

export function isMenuExist(menuName: string, menu: RawMenu): boolean {
  for (var item of menu) {
    if ((item as RawMenuItem).name === menuName) return true;
    if ((item as RawSubMenu).items?.some(({ name }) => name === menuName))
      return true;
  }
  return false;
}

export function getMenuPages(menuName: string, menu: RawMenu): PageRef[] {
  for (var item of menu) {
    if ((item as RawMenuItem).name === menuName) {
      return item.pages || [];
    }
    const menuItem = (item as RawSubMenu).items?.find(
      ({ name }) => name === menuName,
    );
    if (menuItem !== undefined) {
      return menuItem.pages || [];
    }
  }
  return [];
}

export function getMenuLabel(menuName: string, menu: RawMenu): string | null {
  for (var item of menu) {
    if ((item as RawMenuItem).name === menuName)
      return (item as RawMenuItem).label;
    if ((item as RawSubMenu).items?.some(({ name }) => name === menuName))
      return (item as RawSubMenu).items!.find(({ name }) => name === menuName)!
        .label;
  }
  return null;
}
