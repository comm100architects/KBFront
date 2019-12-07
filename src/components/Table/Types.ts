export interface Row {
  [id: string]: any;
}

export interface Sort<T> {
  key: keyof T;
  asc: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
}
