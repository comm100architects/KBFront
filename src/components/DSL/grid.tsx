import React from "react";
import {
  UIPage,
  Entity,
  UIEntityField,
  GlobalSettings,
  UIGridColumn,
} from "./types";
import { CButton, CIconButton, CLink } from "../Buttons";
import {
  emptyTableSource,
  ITableSource,
  LocalTableSource,
} from "../Table/CTableSource";
import { CTable, CTableColumn } from "../Table";
import { CIcon, CIconName } from "../Icons";
import moment from "moment";
import { undefinedDefault, replaceVariables } from "../../framework/utils";
import { toPath, withQueryParam } from "../../framework/locationHelper";

export const makeGridComponent = async (page: UIPage) => {
  const grid = page.grid!;
  const { isAllowNew, newEntityButtonLabel } = grid;
  const Table = await makeTableComponent(page);
  return () => {
    return (
      <div>
        <div>
          {isAllowNew && (
            <CButton primary text={newEntityButtonLabel} to="new" />
          )}
        </div>
        <Table />
      </div>
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

export const makeTableComponent = async (page: UIPage) => {
  const grid = page.grid!;
  const { columns, isAllowEdit, isAllowDelete } = grid;
  const repo = page.repositories[page.entity];
  const tableColumns: CTableColumn<Entity>[] = columns.map(column => {
    const field = page.fields.find(({ name }) => column.fieldName === name)!;
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

  return () => {
    const [source, setSource] = React.useState(
      () => emptyTableSource as ITableSource<Entity>,
    );
    React.useEffect(() => {
      setSource(new LocalTableSource(repo.getList()));
    }, []);
    const handleDelete = async (row: Entity) => {
      if (window.confirm(grid.confirmDeleteMessage)) {
        await repo.delete(row.id);
        setSource(new LocalTableSource(repo.getList()));
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
