import * as React from "react";
import TablePagination from "@material-ui/core/TablePagination";
import { Pagination } from "./Types";

export type CTablePaginationProps = {
  pageSizeOptions: number[];
  pagination: Pagination;
  count: number;
  onChange(state: Pagination): void;
};

export function CTablePagination(props: CTablePaginationProps) {
  const handleChangePage = (_: unknown, newPage: number) => {
    props.onChange({ ...props.pagination, page: newPage });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    props.onChange({
      pageSize: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  return (
    <TablePagination
      rowsPerPageOptions={props.pageSizeOptions}
      component="div"
      count={props.count}
      rowsPerPage={props.pagination.pageSize}
      page={props.pagination.page}
      onChangePage={handleChangePage}
      onChangeRowsPerPage={handleChangeRowsPerPage}
    />
  );
}
