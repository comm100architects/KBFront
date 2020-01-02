import React from "react";
import {
  UIPage,
  Entity,
  UIEntityField,
  GlobalSettings,
  UIGridColumn,
} from "./types";
import { CButton, CIconButton, CLink } from "../components/Buttons";
import {
  emptyTableSource,
  ITableSource,
  LocalTableSource,
} from "../components/Table/CTableSource";
import { CTable, CTableColumn } from "../components/Table";
import { CIcon, CIconName } from "../components/Icons";
import moment from "moment";
import { undefinedDefault, replaceVariables } from "../framework/utils";
import {
  toPath,
  goToSearch,
  withQueryParam,
} from "../framework/locationHelper";
import { QueryItem } from "../framework/repository";
import { CSelect } from "../components/Select";
import { useHistory } from "react-router";
import Query from "query-string";
import { CPage } from "../components/Page";

export const makeGridComponent = async (page: UIPage) => {
  const grid = page.grid!;
  const parentEntities = page.parentEntities;
  const { isAllowNew, newEntityButtonLabel } = grid;
  for (const parentEntity of parentEntities) {
    parentEntity.data = await parentEntity.repo.getList();
  }
  const topRightParentEntity = parentEntities.find(
    ({ position }) => position === "topRightCorner",
  );
  const Table = await makeTableComponent(page);
  return () => {
    const history = useHistory();
    const query = Query.parse(history.location.search);
    const parentEntityId = query[
      topRightParentEntity?.fieldName || ""
    ] as string;
    const filters: QueryItem[] = parentEntities.map(({ fieldName, data }) => ({
      key: fieldName,
      value: (query[fieldName] as string) || data[0]?.id!,
    }));
    return (
      <CPage title={page.title} description={page.description}>
        {topRightParentEntity && (
          <div style={{ position: "absolute", top: "24px", right: "24px" }}>
            <CSelect
              value={parentEntityId}
              options={topRightParentEntity.data.map(({ id, name, title }) => ({
                value: id,
                label: name || title,
              }))}
              onChange={({
                target,
              }: React.ChangeEvent<{ value: string | number }>) => {
                goToSearch(
                  history,
                  withQueryParam(topRightParentEntity.fieldName, target.value),
                );
              }}
            />
          </div>
        )}
        <div>
          <div>
            {isAllowNew && (
              <CButton primary text={newEntityButtonLabel} to="new" />
            )}
          </div>
          <Table filters={filters} />
        </div>
      </CPage>
    );
  };
};

const getLabel = (
  settings: GlobalSettings,
  field: UIEntityField,
  entity: Entity,
) => {
  if (field.labelsForValue) {
    return field.labelsForValue[entity[field.name]].label;
  }
  if (field.type === "dateTime") {
    return moment(entity[field.name]).format(settings.dateTimeFormat);
  }
  return entity[field.name] + "";
};

const rowContent = (
  settings: GlobalSettings,
  field: UIEntityField,
  column: UIGridColumn,
  row: Entity,
) => {
  const textType = () => {
    return getLabel(settings, field, row);
  };

  const linkType = () => {
    const to = replaceVariables(column.linkPath!, row);
    return <CLink text={getLabel(settings, field, row)} to={to} />;
  };

  const iconType = () => {
    const { label, icon } = field.labelsForValue![row[field.name]];
    const iconName = icon! as CIconName;
    if (column.linkPath) {
      const to = replaceVariables(column.linkPath!, row);
      return <CIconButton title={label} icon={iconName} to={to} />;
    }
    return <CIcon name={iconName} />;
  };

  switch (column.cellComponentType) {
    case "text":
      return textType();
    case "link":
      return linkType();
    case "icon":
      return iconType();
  }
};

const makeTableComponent = async (page: UIPage) => {
  const grid = page.grid!;
  const { columns, isAllowEdit, isAllowDelete } = grid;
  const entityRepo = page.entityRepo;
  const tableColumns: CTableColumn<Entity>[] = columns.map(column => {
    const field = page.entity.fields.find(
      ({ name }) => column.fieldName === name,
    )!;
    return {
      id: field.name,
      header: undefinedDefault(column.headerLabel, field.title),
      sortable: undefinedDefault(column.isAllowSort, true),
      content: (row: Entity) => rowContent(page.settings, field, column, row),
      width: column.width,
    };
  });
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
              to={toPath("edit", withQueryParam("id", row.id))}
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

  return ({ filters }: { filters: QueryItem[] }) => {
    const [source, setSource] = React.useState(
      () => emptyTableSource as ITableSource<Entity>,
    );

    React.useEffect(() => {
      setSource(new LocalTableSource(entityRepo.getList(filters)));
    }, [...filters.map(({ value }) => value)]);
    const handleDelete = async (row: Entity) => {
      if (window.confirm(grid.confirmDeleteMessage)) {
        await entityRepo.delete(row.id!);
        setSource(new LocalTableSource(entityRepo.getList(filters)));
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
