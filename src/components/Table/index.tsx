import * as React from "react";
import { CIconButtonProps } from "../Buttons";
import Paper from "@material-ui/core/Paper";
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
import { CElementProps } from "../Base";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    iconCell: {
      width: 25,
    },
    root: {
      width: "100%",
      marginTop: theme.spacing(2),
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
      border: `solid 1px ${theme.palette.divider}`,
    },
    tableWrapper: {
      overflowX: "auto",
    },
    noRecords: {
      height: 100,
      borderBottom: "none",
    },
  }),
);

export interface CTableColumnContentProps<T> {
  row: T;
  onDelete?: () => void;
}

export interface CTableColumn<T extends Row> {
  id: string;
  header?: string | JSX.Element;
  content?: React.ComponentType<CTableColumnContentProps<T>>;
  sortable?: boolean;
  width?: string;
}

export type CTableAction<T> = (row: T) => CIconButtonProps;

export interface CTableProps<T> extends CElementProps {
  columns: CTableColumn<T>[];
  dataSource: ITableSource<T>;
  pagination?: boolean;
  defaultSort?: Sort<T>;
  onDelete?(row: T): void;
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
    <div id={props.id} className={classes.root}>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.tableWrapper}>
          <Table>
            <TableHead>
              <TableRow>
                {props.columns.map(col => (
                  <TableCell
                    key={col.id as string}
                    style={{ width: col.width || "auto" }}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={sort?.key === col.id}
                        direction={sort?.asc ? "asc" : "desc"}
                        hideSortIcon
                        onClick={createSortHandler(col.id)}
                      >
                        {col.header}
                      </TableSortLabel>
                    ) : (
                      <>{col.header}</>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.count === 0 ? (
                <TableRow>
                  <TableCell
                    className={classes.noRecords}
                    colSpan={props.columns.length}
                    align="center"
                  >
                    No records to display
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map(row => {
                  return (
                    <TableRow hover key={row.id}>
                      {props.columns.map(col => {
                        return (
                          <TableCell key={col.id as string} align="left">
                            {col.content &&
                              React.createElement(col.content, {
                                row,
                                onDelete:
                                  props.onDelete &&
                                  (() => props.onDelete!(row)),
                              })}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {showPagination && data.count > 0 && (
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
// sorting
//
//
// sorting
//
