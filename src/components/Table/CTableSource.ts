import { Row, Sort, Pagination } from "./Types";

export interface ITableSource<T> {
  getData(
    sort?: Sort<T>,
    paginationState?: Pagination,
  ): Promise<{ rows: T[]; count: number }>;
}
export class LocalTableSource<T> implements ITableSource<T> {
  private rows: T[];
  constructor(rows: T[]) {
    this.rows = rows;
  }

  sortRows(rows: T[], sort?: Sort<T>) {
    return sort ? stableSort(rows, getSorting<T>(sort!)) : rows;
  }

  paginationRows(rows: T[], pagination?: Pagination) {
    return pagination
      ? rows.slice(
          pagination!.page * pagination!.pageSize,
          pagination!.page * pagination!.pageSize + pagination!.pageSize,
        )
      : rows;
  }

  getData(
    sort?: Sort<T>,
    pagination?: Pagination,
  ): Promise<{ rows: T[]; count: number }> {
    const rows = this.paginationRows(
      this.sortRows(this.rows, sort),
      pagination,
    );
    return Promise.resolve({ rows, count: this.rows.length });
  }
}

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

function getSorting<T>({ asc, key }: Sort<T>): (a: Row, b: Row) => number {
  return asc
    ? (a, b) => -desc(a, b, key as string)
    : (a, b) => desc(a, b, key as string);
}
