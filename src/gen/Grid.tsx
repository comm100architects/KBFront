import React from "react";
import _ from "lodash";
import {
  Entity,
  GlobalSettings,
  UIGridColumn,
  EntityInfo,
  EntityField,
} from "./types";
import { CButton, CIconButton, CLink } from "../components/Buttons";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import {
  emptyTableSource,
  ITableSource,
  LocalTableSource,
} from "../components/Table/CTableSource";
import { CConfirmDialog } from "../components/Dialog";
import { CTable, CTableColumn } from "../components/Table";
import { CIcon } from "../components/Icons";
import moment from "moment";
import { undefinedDefault, replaceVariables } from "../framework/utils";
import {
  toPath,
  goToSearch,
  withQueryParam,
} from "../framework/locationHelper";
import { QueryItem } from "../framework/repository";
import { CSelect } from "../components/Select";
import { makeSelect } from "./Select";
import { makeKeywordSearch } from "./KeywordSearch";
import { useHistory } from "react-router";
import Query from "query-string";
import { CPage } from "../components/Page";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topRightCorner: {
      position: "absolute",
      top: theme.spacing(3),
      right: theme.spacing(3),
    },
    tableToolbar: {
      display: "flex",
    },
    tableToolbarLeft: {
      flexGrow: 1,
    },
    tableToolbarRight: {
      display: "flex",
    },
    tableFilterRoot: {
      marginLeft: theme.spacing(2),
    },
  }),
);

const makeFilters = async ({
  grid,
  fields,
}: EntityInfo): Promise<React.ComponentType<any>> => {
  const filters = await Promise.all(
    grid!.filters.map(filter => {
      switch (filter.componentType) {
        case "select":
          const field = fields.find(({ name }) => name === filter.fieldName)!;
          return makeSelect(field, field.label || "\u3000");
        case "keywordSearch":
          return makeKeywordSearch();
        default:
          throw new Error(
            `Unknown filter componentType: ${filter.componentType}`,
          );
      }
    }),
  );
  return ({
    onFilter,
    parameters,
  }: {
    onFilter: (p: { [key: string]: string }) => void;
    parameters: { [key: string]: string };
  }) => {
    const classes = useStyles();
    const handleChange = (
      key: string,
      { target }: { target: { value: string } },
    ) => {
      onFilter({ ...parameters, [key]: target.value.toString() });
    };

    return (
      <>
        {filters.map((Filter, i) => {
          const name = grid!.filters[i].fieldName;
          return (
            <div className={classes.tableFilterRoot} key={name}>
              <Filter
                value={parameters[name]}
                onChange={(e: any) => handleChange(name, e)}
              />
            </div>
          );
        })}
      </>
    );
  };
};

export const makeGridComponent = async (
  settings: GlobalSettings,
  entity: EntityInfo,
) => {
  const grid = entity.grid!;
  const { isAllowNew, labelForNewButton } = grid;
  // const parentEntities = await (
  //   await entity.parentSelector!
  // ).entity?.repo.getList();
  // const topRightParentEntity = parentEntities.find(
  //   ({ position }) => position === "topRightCorner",
  // );
  const Table = await makeTableComponent(settings, entity);
  const Filters = await makeFilters(entity);
  const selectorEntities = await (
    entity.selector &&
    entity.selector.referenceEntity &&
    (await entity.selector.referenceEntity())
  )?.repo.getList();
  const parentSelector =
    entity.parentSelector && (await entity.parentSelector());
  const parentEntities = await parentSelector?.entity?.repo.getList();
  const grandparentSelector =
    entity.grandparentSelector && (await entity.grandparentSelector());
  const grandparentEntities = await grandparentSelector?.entity?.repo.getList();
  const selectorField =
    (grandparentSelector || parentSelector)?.childField || entity.selector;
  const selectorFieldName = selectorField?.name;
  return () => {
    const classes = useStyles();
    const history = useHistory();
    const query = Query.parse(history.location.search);
    const parentEntityId =
      selectorFieldName && (query[selectorFieldName] as string);
    const queryItems: QueryItem[] =
      (selectorField && [
        {
          key: selectorField.name,
          value:
            (query[selectorField.name] as string) ||
            (grandparentEntities && grandparentEntities[0].id) ||
            (parentEntities && parentEntities[0].id) ||
            (selectorEntities && selectorEntities[0].id) ||
            "",
        },
      ]) ||
      [];

    const [parameters, setParameters] = React.useState({});

    return (
      <CPage
        title={entity.titleForMultiRowsUI}
        description={entity.description}
        footerHtml={settings.poweredByHtml}
      >
        {selectorField && (
          <div className={classes.topRightCorner}>
            <FormControl>
              {selectorField.label && (
                <InputLabel>{selectorField.label}</InputLabel>
              )}
              <CSelect
                value={parentEntityId}
                options={(
                  grandparentEntities ||
                  parentEntities ||
                  selectorEntities ||
                  []
                ).map(({ id, name, title }) => ({
                  value: id,
                  label: name || title,
                }))}
                onChange={({
                  target,
                }: React.ChangeEvent<{ value: string | number }>) => {
                  goToSearch(
                    history,
                    withQueryParam(selectorField.name, target.value),
                  );
                }}
              />
            </FormControl>
          </div>
        )}
        <div>
          <div className={classes.tableToolbar}>
            <div className={classes.tableToolbarLeft}>
              {isAllowNew && (
                <CButton primary text={labelForNewButton} to={toPath("new")} />
              )}
            </div>
            <div className={classes.tableToolbarRight}>
              <Filters parameters={parameters} onFilter={setParameters} />
            </div>
          </div>
          <Table queryItems={queryItems} filters={parameters} />
        </div>
      </CPage>
    );
  };
};

const getLabel = (
  settings: GlobalSettings,
  field: EntityField,
  entity: Entity,
  data: { [id: string]: Entity },
  fieldToBeDisplayedWhenReferenced?: string,
) => {
  if (field.labelsForValue) {
    return field.labelsForValue[entity[field.name]].label;
  }
  if (field.type === "dateTime") {
    return moment(entity[field.name]).format(settings.dateTimeFormat);
  }
  if (field.type === "reference") {
    const value = entity[field.name];
    if (_.isArray(value)) {
      const items = value as string[];
      return items
        .map(id => {
          return (
            fieldToBeDisplayedWhenReferenced &&
            data[id][fieldToBeDisplayedWhenReferenced]
          );
        })
        .toString();
    }
    const item = data[entity[field.name]];
    return item.title || item.name;
  }
  return entity[field.name] + "";
};

const rowContent = (
  settings: GlobalSettings,
  column: UIGridColumn,
  row: Entity,
  fieldData: { [id: string]: Entity },
  fieldToBeDisplayedWhenReferenced?: string,
) => {
  const field = column.field!;
  const textType = () => {
    if (column.link) {
      const to = replaceVariables(column.link!, row);
      return (
        <CLink
          text={getLabel(
            settings,
            field,
            row,
            fieldData,
            fieldToBeDisplayedWhenReferenced,
          )}
          to={to}
        />
      );
    }
    return getLabel(
      settings,
      field,
      row,
      fieldData,
      fieldToBeDisplayedWhenReferenced,
    );
  };

  const iconType = () => {
    const value = row[field.name];
    const { label, icon } = field.labelsForValue!.find(
      ({ key }) => key === value,
    )!;

    if (!icon) {
      throw new Error(
        `Field ${field.name} renderred as icon but no icon in labelsForValue field`,
      );
    }

    if (column.link) {
      const to = replaceVariables(column.link, row);
      return <CIconButton title={label} icon={icon} to={to} />;
    }
    return (
      <Tooltip title={label}>
        <CIcon name={icon} />
      </Tooltip>
    );
  };

  if (column.isIcon) {
    return iconType();
  }
  return textType();
};

const makeTableComponent = async (
  settings: GlobalSettings,
  entity: EntityInfo,
) => {
  const grid = entity.grid!;
  const { columns, isAllowEdit, isAllowDelete } = grid;
  const entityRepo = entity.repo;
  const tableColumns: CTableColumn<Entity>[] = await Promise.all(
    columns.map(async column => {
      const field = entity.fields.find(
        ({ name }) => column.fieldName === name,
      )!;

      const referenceEntity =
        field.referenceEntity && (await field.referenceEntity());

      const list =
        field.type === "reference"
          ? (await referenceEntity?.repo.getList()) || []
          : [];

      const fieldData = list.reduce((res, item) => {
        return { ...res, [item.id!]: item };
      }, {});

      const getWidth = () => {
        if (column.width) return column.width;
        if (column.isIcon) return "16px";
        if (field?.type === "dateTime") {
          return `${settings.dateTimeFormat.length + 3}ch`;
        }
      };

      return {
        id: field.name,
        header: column.headerIcon ? (
          <CIcon name={column.headerIcon} />
        ) : (
          undefinedDefault(column.headerLabel, field.label)
        ),
        sortable: undefinedDefault(column.isAllowSort, true),
        content: (row: Entity) =>
          rowContent(
            settings,
            column,
            row,
            fieldData,
            referenceEntity?.fieldToBeDisplayedWhenReferenced,
          ),
        width: getWidth(),
      };
    }),
  );
  tableColumns.push({
    id: "operations",
    header: "Operations",
    sortable: false,
    content: (row: Entity, onDelete?: () => void) => {
      return (
        <span style={{ whiteSpace: "nowrap" }}>
          {isAllowEdit && (
            <CIconButton
              title="Edit"
              icon="edit"
              to={toPath("update", withQueryParam("id", row.id))}
            />
          )}
          {isAllowDelete && (
            <CIconButton
              title="Delete"
              icon="delete"
              onClick={() => onDelete!()}
            />
          )}
        </span>
      );
    },
    width: "1px",
  });

  const defaultSortColumn = tableColumns.find(({ sortable }) => sortable);
  const defaultSort = defaultSortColumn && {
    key: defaultSortColumn.id,
    asc: true,
  };

  return ({
    queryItems,
    filters,
  }: {
    queryItems: QueryItem[];
    filters: { [key: string]: string };
  }) => {
    const [source, setSource] = React.useState(
      () => emptyTableSource as ITableSource<Entity>,
    );

    const fetchSource = () => {
      const items = queryItems.concat(
        Object.keys(filters)
          .map(key => ({
            key,
            value: (filters as { [key: string]: string })[key],
          }))
          .filter(({ value }) => value !== ""),
      );
      setSource(new LocalTableSource(entityRepo.getList(items)));
    };

    React.useEffect(() => {
      fetchSource();
    }, [queryItems, filters]);
    const handleDelete = async (row: Entity) => {
      if (await CConfirmDialog(grid.confirmDeleteMessage)) {
        await entityRepo.delete(row.id!);
        fetchSource();
      }
    };
    return (
      <CTable<Entity>
        columns={tableColumns}
        defaultSort={defaultSort}
        dataSource={source}
        onDelete={handleDelete}
      />
    );
  };
};
