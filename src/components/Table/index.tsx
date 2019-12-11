import * as React from "react";
import { LinkIcon } from "../Buttons";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { CTablePagination } from "./Pagination";
import { ITableSource } from "./CTableSource";
import { Row, Sort } from "./Types";
import * as H from "history";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actions: { whiteSpace: "nowrap" },
    iconCell: {
      width: 25,
    },
    root: {
      width: "100%",
      marginTop: theme.spacing(3),
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
      border: `solid 1px ${theme.palette.divider}`,
    },
    tableWrapper: {
      overflowX: "auto",
    },
  }),
);

export interface CTableColumn<T extends Row> {
  id: string;
  header?: string | JSX.Element;
  content?(arg: T): null | undefined | string | JSX.Element;
  sortable?: boolean;
}

export interface CTableAction<T> {
  icon: JSX.Element;
  link?(
    row: T,
  ):
    | H.LocationDescriptor<H.LocationState>
    | ((
        location: H.Location<H.LocationState>,
      ) => H.LocationDescriptor<H.LocationState>);
  onClick?(row: T): void;
}

export interface CTableProps<T> {
  columns: CTableColumn<T>[];
  actions?: CTableAction<T>[];
  dataSource: ITableSource<T>;
  pagination?: boolean;
  defaultSort?: Sort<T>;
}

function renderContent<T extends Row>(
  col: CTableColumn<T>,
  row: T,
): JSX.Element {
  if (col.content) {
    const s = col.content!(row);
    if (typeof s === "string") {
      return <>{s as string}</>;
    }
    return s as JSX.Element;
  }
  return <>{row[col.id]}</>;
}

export function CTable<T extends Row>(props: CTableProps<T>): JSX.Element {
  const classes = useStyles();
  const [data, setData] = React.useState({ rows: [] as T[], count: 0 });

  const showPagination = props.pagination === undefined || props.pagination;
  const pageSizeOptions = [5, 10, 25, 50, 100, 500];
  const [pagination, setPagination] = React.useState({
    pageSize: pageSizeOptions[0],
    page: 0,
  });

  const [sort, setSort] = React.useState(props.defaultSort as Sort<T>);

  React.useEffect(() => {
    props.dataSource.getData(sort, pagination).then(setData);
  }, [sort, pagination, props.dataSource]);

  const createSortHandler = (column: keyof T) => () => {
    setSort({
      key: column,
      asc: sort!.key !== column || !sort!.asc,
    });
  };

  return (
    <div className={classes.root}>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.tableWrapper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {props.columns.map(col => (
                  <TableCell key={col.id as string}>
                    {col.sortable && (
                      <TableSortLabel
                        active={sort?.key === col.id}
                        direction={sort?.asc ? "asc" : "desc"}
                        hideSortIcon
                        onClick={createSortHandler(col.id)}
                      >
                        {col.header}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
                <TableCell key="actions" align="center" size="small">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows.map(row => {
                return (
                  <TableRow hover>
                    {props.columns.map(col => {
                      return (
                        <TableCell key={col.id as string} align="left">
                          {renderContent(col, row)}
                        </TableCell>
                      );
                    })}
                    {props.actions && (
                      <TableCell
                        key="actions"
                        align="center"
                        size="small"
                        className={classes.actions}
                      >
                        {props.actions?.map((action, i) => {
                          if (action.link) {
                            return (
                              <LinkIcon
                                key={i}
                                size="small"
                                to={action.link!(row)}
                              >
                                {action.icon}
                              </LinkIcon>
                            );
                          }
                          const handleClick = action.onClick
                            ? () => action.onClick!(row)
                            : undefined;
                          return (
                            <IconButton size="small" onClick={handleClick}>
                              {action.icon}
                            </IconButton>
                          );
                        })}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {showPagination && (
          <CTablePagination
            pageSizeOptions={pageSizeOptions}
            count={data.count}
            pagination={pagination}
            onChange={setPagination}
          />
        )}
      </Paper>
    </div>
  );
}

//
// sorting
//