import { Row, Sort, Pagination } from "./Types";

export interface ITableSource<T> {
  getData(
    sort?: Sort<T>,
    paginationState?: Pagination,
  ): Promise<{ rows: T[]; count: number }>;
}

export class EmptyTableSource<T> implements ITableSource<T> {
  private count: number;
  constructor(count: number = 0) {
    this.count = count;
  }
  getData(
    sort?: Sort<T> | undefined,
    paginationState?: Pagination | undefined,
  ): Promise<{ rows: T[]; count: number }> {
    return Promise.resolve({ rows: [], count: this.count });
  }
}

export const emptyTableSource = new EmptyTableSource(0);

export class LocalTableSource<T> implements ITableSource<T> {
  private rows: Promise<T[]>;
  constructor(rows: T[] | Promise<T[]>) {
    if (rows instanceof Promise) {
      this.rows = rows;
    } else {
      this.rows = Promise.resolve(rows as T[]);
    }
  }

  private sortRows(rows: T[], sort?: Sort<T>) {
    return sort ? stableSort(rows, getSorting<T>(sort!)) : rows;
  }

  private paginationRows(rows: T[], pagination?: Pagination) {
    if (pagination) {
      const page =
        pagination.page * pagination.pageSize > rows.length
          ? 0
          : pagination.page;
      const pageSize = pagination!.pageSize;
      return rows.slice(page * pageSize, page * pageSize + pageSize);
    }
    return rows;
  }

  async getData(
    sort?: Sort<T>,
    pagination?: Pagination,
  ): Promise<{ rows: T[]; count: number }> {
    const rows = await this.rows;
    const displayRows = this.paginationRows(
      this.sortRows(rows, sort),
      pagination,
    );
    return {
      rows: displayRows,
      count: rows.length,
    };
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
