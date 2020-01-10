import _ from "lodash";
import { IRepository, RESTfulRepository } from "../framework/repository";
import { CIconName, fetchAndCacheIcons } from "../components/Icons";
import {
  UIAction,
  RawTopMenu,
  RawSideMenu,
  RawEntityField,
  RawGlobalSettings,
  RawEntity,
  RawUIGrid,
  RawUIGridColumn,
  RawUIRow,
  RawUIForm,
  RawUIGridFilter,
  ComponentType,
  RawUISelector,
  EnumItem,
} from "./rawTypes";
import { fetchJson } from "../framework/network";
import { evalConditions, wordsInsideSentence } from "../framework/utils";

export interface EntityInfo {
  name: string;
  nameForPlural: string;
  label: string;
  labelForPlural: string;
  titleForNew: string;
  titleForEdit: string;
  titleForMultiRowsUI: string;
  description?: string;
  repo: IRepository<Entity>;
  isSingleRecord: boolean;
  selector?: EntityField;
  parentSelector?: () => Promise<UISelector>;
  grandparentSelector?: () => Promise<UISelector>;
  fields: EntityField[];
  grid?: UIGrid;
  newForm?: UINewForm;
  updateForm?: UIUpdateForm;
  fieldToBeDisplayedWhenReferenced: string;
}

export interface UISelector {
  entity?: EntityInfo;
  childField: EntityField;
  componentType: "select" | "tree";
  componentPosition: "topRightCorner" | "left";
}

export { UIAction, ComponentType };

export interface EntityField {
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
  referenceEntity?: () => Promise<EntityInfo>;
}

export interface EntityFormControl {
  field: EntityField;
  componentType: ComponentType;
  indent: 0 | 1;
  conditionPred(entity: Entity): boolean;
}

export interface UINewForm {
  defaultValues: Entity;
  rows: EntityFormControl[];
}

export interface UIUpdateForm {
  isDiscardOrCancel: boolean;
  rows: EntityFormControl[];
}

export type EntityFieldType =
  | "string"
  | "int"
  | "enum"
  | "reference"
  | "bool"
  | "reference"
  | "guid"
  | "selfIncreaseId"
  | "dateTime";

export interface IconSvg {
  name: string;
  svg: string;
}

export interface GlobalSettings {
  endPointPrefix: string;
  dateTimeFormat: string;
  poweredByHtml: string;
  selectedTopMenu: TopMenu;
  topMenus: TopMenu[];
}

export interface UIGridFilter {
  fieldName: string;
  field?: EntityField;
  componentType: "select" | "keywordSearch";
}

export interface UIGrid {
  columns: UIGridColumn[];
  isAllowNew: boolean;
  isAllowEdit: boolean;
  isAllowDelete: boolean;
  labelForNewButton: string;
  confirmDeleteMessage: string;
  filters: UIGridFilter[];
}

export interface UIGridColumn {
  headerLabel: string;
  headerIcon?: CIconName;
  isAllowSort: boolean;
  fieldName: string;
  isIcon: boolean;
  link?: string;
  width?: string;
  field?: EntityField;
}

export type EntityKey = string | number;
export type Entity = { id?: EntityKey; [key: string]: any };

export interface TopMenu {
  name: string;
  label: string;
  menus: SideMenu[];
}

export interface SideMenu {
  name: string;
  label: string;
  icon?: CIconName;
  submenu?: SideMenu[];
  page: PageProps;
}

export interface PageProps {
  entity: () => Promise<EntityInfo>;
  isMultiRowsUI: boolean;
  actionForSingleRow?: UIAction;
}

const delayCache: { result?: any }[] = [];
const delay = (fn: () => Promise<any>): (() => Promise<any>) => {
  const i = delayCache.length;
  delayCache.push({});
  return () => {
    const item = delayCache[i];
    if (!item.result) {
      item.result = fn();
    }
    return item.result;
  };
};

const bindDelayedPromises = (
  a: () => Promise<any>,
  genb: (resa: any) => () => Promise<any>,
): (() => Promise<any>) => {
  return async () => {
    const resa = await a();
    return await genb(resa)();
  };
};

export const parseRawGlobalSettings = async (
  rawGlobalSettings: RawGlobalSettings,
): Promise<GlobalSettings> => {
  const { endPointPrefix, dateTimeFormat, poweredByHtml } = rawGlobalSettings;
  await fetchAndCacheIcons(`${endPointPrefix}/icons`);
  const menus = await fetchJson<RawTopMenu[]>(
    `${endPointPrefix}/topMenus`,
    "GET",
  );
  if (!menus || menus.length === 0) {
    throw new Error("TopMenu is empty.");
  }

  const topMenus = menus.map(parseRawTopMenu.bind(null, rawGlobalSettings));
  return {
    endPointPrefix,
    dateTimeFormat,
    poweredByHtml,
    selectedTopMenu: topMenus[0],
    topMenus,
  };
};

export const findMenu = (
  { menus }: TopMenu,
  menuName: string,
): SideMenu | undefined => {
  for (const sideMenu of menus) {
    const item = sideMenu.submenu
      ? sideMenu.submenu.find(({ name }) => name === menuName.toLowerCase())
      : sideMenu.name === menuName.toLowerCase() && sideMenu;
    if (item) return item;
  }
};

export const fetchEntity = async (
  settings: RawGlobalSettings,
  name: string,
): Promise<EntityInfo> => {
  if (!name) {
    throw new Error(
      "When fetch an entity, entity's name MUST NOT be null or empty.",
    );
  }

  const rawEntity = (await fetchJson(
    `${settings.endPointPrefix}/entities/${name}`,
    "GET",
  )) as RawEntity;
  return parseRawEntity(settings, rawEntity);
};

const parseRawEntity = (
  settings: RawGlobalSettings,
  rawEntity: RawEntity,
): EntityInfo => {
  try {
    const {
      name,
      nameForPlural,
      label,
      labelForPlural,
      selector,
      parentSelector,
      grandparentSelector,
      isSingleRecord,
      grid,
      form,
      fields,
      fieldToBeDisplayedWhenReferenced,
      description,
    } = rawEntity;

    const entityFields = fields.map(parseRawEntityField.bind(null, settings));

    const parsedParentSelector =
      parentSelector && delay(parseRawUISelector(entityFields, parentSelector));

    const [newForm, updateForm] = form
      ? parseRawUIForm(entityFields, form)
      : [undefined, undefined];
    return {
      name,
      nameForPlural,
      label,
      labelForPlural,
      titleForNew: `New ${rawEntity.label}`,
      titleForEdit: `Edit ${rawEntity.label}`,
      titleForMultiRowsUI: rawEntity.labelForPlural,
      description,
      repo: new RESTfulRepository(
        settings.endPointPrefix,
        isSingleRecord ? name : nameForPlural,
      ),
      selector: selector
        ? mustFindField(fields, selector, "selector")
        : undefined,
      parentSelector: parsedParentSelector,
      grandparentSelector:
        grandparentSelector &&
        delay(
          parseRawGrandparentUISelector(
            parsedParentSelector!,
            grandparentSelector,
          ),
        ),
      isSingleRecord,
      fields: entityFields,
      grid: grid && parseRawUIGrid(entityFields, rawEntity, grid),
      newForm,
      updateForm,
      fieldToBeDisplayedWhenReferenced,
    };
  } catch (err) {
    // FIXME: not sure if the stack will be preserved.
    throw new Error(`Parse entity ${name} failed: ${err.message}`);
  }
};

const mustFindField = (
  fields: EntityField[],
  fieldName: string,
  source: string,
): EntityField => {
  const field = fields.find(({ name }) => name === fieldName)!;
  if (!field) {
    throw new Error(`Field "${fieldName}"(read from ${source}) not exist.`);
  }
  return field;
};

const parseRawUISelector = (
  fields: EntityField[],
  rawUISelect: RawUISelector,
) => async (): Promise<UISelector> => {
  const { fieldName, componentType, componentPosition } = rawUISelect;
  const childField = mustFindField(
    fields,
    fieldName,
    "(grand)parentSelector.fieldName",
  );
  return {
    entity: await (childField.referenceEntity && childField.referenceEntity()),
    childField,
    componentType,
    componentPosition,
  };
};

const parseRawGrandparentUISelector = (
  parsedParentSelector: () => Promise<UISelector>,
  rawGrandparentUISelect: RawUISelector,
): (() => Promise<UISelector>) => {
  return bindDelayedPromises(
    parsedParentSelector,
    (parentSelector: UISelector) => {
      if (!parentSelector.entity) {
        throw new Error(
          "If parentSelector is not a reference to another entity, there MUST NOT be a groundparentSeletor.",
        );
      }
      return parseRawUISelector(
        parentSelector.entity.fields,
        rawGrandparentUISelect,
      );
    },
  );
};

const parseRawEntityField = (
  settings: RawGlobalSettings,
  rawEntityField: RawEntityField,
): EntityField => {
  const { type, referenceEntityName, name } = rawEntityField;
  if (type === "reference") {
    if (!referenceEntityName) {
      throw new Error(
        `Field "${name}" is reference to another entity but referenceEntityName is null or empty.`,
      );
    }
  }
  return {
    ...rawEntityField,
    referenceEntity:
      type === "reference"
        ? delay(async () => {
            const entity = await fetchEntity(settings, referenceEntityName!);
            if (!entity.fieldToBeDisplayedWhenReferenced) {
              throw new Error(
                `Entity ${entity.name}'s fieldToBeDisplayedWhenReferenced MUST NOT be null or empty`,
              );
            }
            return entity;
          })
        : undefined,
  };
};

const parseRawUIGrid = (
  fields: EntityField[],
  entity: RawEntity,
  { isAllowNew, isAllowEdit, isAllowDelete, columns, filters }: RawUIGrid,
): UIGrid => {
  return {
    columns: columns.map(parseRawUIGridColumn.bind(null, fields)),
    isAllowNew,
    isAllowEdit,
    isAllowDelete,
    filters: filters.map(parseRawUIGridFilter.bind(null, fields)),
    labelForNewButton: isAllowNew ? `New ${entity.label}` : "",
    confirmDeleteMessage: isAllowDelete
      ? `Are you sure you want to delete this ${wordsInsideSentence(
          entity.label,
        )}?`
      : "",
  };
};

const parseRawUIGridFilter = (
  fields: EntityField[],
  rawUIGridFilter: RawUIGridFilter,
): UIGridFilter => {
  const { componentType, fieldName } = rawUIGridFilter;
  const field =
    componentType === "keywordSearch"
      ? undefined
      : mustFindField(fields, fieldName!, "gridFilter.fieldName");
  return {
    componentType,
    fieldName: field?.name || "keyword",
    field,
  };
};

const parseRawUIGridColumn = (
  fields: EntityField[],
  rawUIGridColumn: RawUIGridColumn,
): UIGridColumn => {
  const {
    headerIcon,
    isAllowSort,
    fieldName,
    isIcon,
    link,
    width,
  } = rawUIGridColumn;
  // FIXME: should be HTTPResultField
  const field = mustFindField(fields, fieldName, "column.fieldName");
  return {
    headerLabel: isIcon ? "" : field.label,
    headerIcon,
    isAllowSort,
    fieldName,
    isIcon,
    link,
    width,
    field,
  };
};

const parseRawUIForm = (
  fields: EntityField[],
  rawForm: RawUIForm,
): [UINewForm, UIUpdateForm] => {
  const { isDiscardOrCancel, rows } = rawForm;
  const parsedRows = rows.map(parseRawUIRow.bind(null, fields));
  return [
    {
      defaultValues: fields.reduce(
        (res, field) => {
          return {
            ...res,
            [field.name]: field.default,
          };
        },
        { id: "" },
      ),
      rows: parsedRows.filter(row => row.field.isVisibleForNew),
    },
    {
      isDiscardOrCancel,
      rows: parsedRows.filter(row => row.field.isVisibleForEdit),
    },
  ];
};

const parseRawUIRow = (
  fields: EntityField[],
  {
    indent,
    conditionForShowing,
    conditionLogic,
    componentType,
    fieldName,
  }: RawUIRow,
): EntityFormControl => {
  return {
    componentType,
    indent: indent || 0,
    conditionPred: conditionForShowing
      ? (entity: Entity): boolean =>
          evalConditions(
            conditionForShowing,
            entity,
            (conditionLogic || "and") === "and",
          )
      : () => true,
    field: mustFindField(fields, fieldName, "formRow.fieldName"),
  };
};

const labelToName = (label: string): string => {
  return label.replace(/[^\w]+/g, "").toLowerCase();
};

const parseRawTopMenu = (
  settings: RawGlobalSettings,
  { label, menus }: RawTopMenu,
): TopMenu => {
  const menus1 = menus
    .filter(item => !item.parentMenuLabel)
    .map(item => {
      const sideMenu = parseSideMenu(settings, item);
      const submenu = menus
        .filter(({ parentMenuLabel }) => parentMenuLabel === sideMenu.label)
        .map(parseSideMenu.bind(null, settings));

      if (submenu.length === 0) {
        return sideMenu;
      }
      return { ...sideMenu, submenu };
    });
  return { label, name: labelToName(label), menus: menus1 };
};

const parseSideMenu = (
  settings: RawGlobalSettings,
  { label, icon, entityName, isMultiRowsUI, actionForSingleRow }: RawSideMenu,
): SideMenu => {
  return {
    name: labelToName(label),
    label,
    icon,
    page: {
      entity: delay(() => fetchEntity(settings, entityName)),
      isMultiRowsUI,
      actionForSingleRow,
    },
  };
};
