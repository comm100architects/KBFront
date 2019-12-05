import * as React from "react";
import { LinkIcon } from "./Buttons";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

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

type Row = { [id: string]: any };

export interface TableColumn<T extends Row> {
  id: string;
  header?: string | JSX.Element;
  content?: (arg: T) => null | undefined | string | JSX.Element;
  sortable?: boolean;
}

export interface TableAction<T> {
  icon: JSX.Element;
  link?(row: T): string;
  onClick?(row: T): void;
}

export interface TableSortState {
  column: string;
  asc: boolean;
}

export interface TablePaginationState {
  page: number;
  pageSize: number;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  rows: T[];
  pagination?: boolean;
  defaultSort?: TableSortState;
}

function renderContent<T extends Row>(
  col: TableColumn<T>,
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

type TableState = {
  pagination?: TablePaginationState;
  sort?: TableSortState;
};

export function CTable<T extends Row>(props: TableProps<T>): JSX.Element {
  const pagination = props.pagination === undefined || props.pagination;
  const classes = useStyles();
  const pageSizeOptions = [5, 10, 25, 50, 100, 500];
  const [state, setState] = React.useState({
    pagination: {
      pageSize: pagination ? pageSizeOptions[0] : rows.length,
      page: 0,
    },
    sort: props.defaultSort,
  } as TableState);

  const handleRequestSort = (_: React.MouseEvent<unknown>, column: string) => {
    const isDesc = state.sort?.column === column && !state.sort?.asc;
    setState({
      ...state,
      sort: {
        column: column,
        asc: isDesc,
      },
    });
  };

  const createSortHandler = (column: string) => (
    event: React.MouseEvent<unknown>,
  ) => {
    handleRequestSort(event, column);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setState({ ...state, page: newPage });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setState({
      ...state,
      pagination: {
        pageSize: parseInt(event.target.value, 10),
        page: 0,
      },
    });
  };

  return (
    <div className={classes.root}>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.tableWrapper}>
          <Table>
            <TableHead>
              <TableRow>
                {props.columns.map(col => (
                  <TableCell key={col.id}>
                    {col.sortable && (
                      <TableSortLabel
                        active={state.sort?.column === col.id}
                        direction={state.sort?.asc ? "asc" : "desc"}
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
              {(state.sort
                ? stableSort(props.rows, getSorting(state.sort!))
                : props.rows
              )
                .slice(
                  state.page * state.pagination.pageSize,
                  state.page * state.pagination.pageSize +
                    state.pagination.pageSize,
                )
                .map(row => {
                  return (
                    <TableRow hover>
                      {props.columns.map(col => {
                        return (
                          <TableCell key={col.id} align="left">
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
                          {props.actions?.map(action => {
                            if (action.link) {
                              return (
                                <LinkIcon size="small" to={action.link!(row)}>
                                  {action.icon}
                                </LinkIcon>
                              );
                            }
                            const handleClick = action.onClick
                              ? (_: React.MouseEvent<HTMLElement>) =>
                                  (action.onClick! as (arg: T) => void)(row)
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
        {pagination && (
          <TablePagination
            rowsPerPageOptions={pageSizeOptions}
            component="div"
            count={props.rows.length}
            rowsPerPage={state.rowsPerPage}
            page={state.page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </div>
  );
}

//
// sorting
//
function stableSort<T>(array: T[], cmp: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function desc(a: Row, b: Row, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

const getSorting = ({
  asc,
  column,
}: TableSortState): ((a: Row, b: Row) => number) => {
  return asc ? (a, b) => -desc(a, b, column) : (a, b) => desc(a, b, column);
};
