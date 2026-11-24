export type SortDirection = "asc" | "desc";
export type FilterOperator =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "contains";

export interface SortRule {
  field: string;
  dir: SortDirection;
}

export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: string;
}

export interface TableState {
  page: number;
  size: number;
  sort: SortRule[];
  filters: FilterRule[];
}

export const DEFAULT_TABLE_STATE: TableState = {
  page: 1,
  size: 20,
  sort: [],
  filters: [],
};

export interface TableColumn extends Record<string, unknown> {
  field: string;
  title: string;
}

export interface TableRow extends Record<string, unknown> {}

export interface TabulatorLike {
  destroy(): void;
}

/**
 * Tabulator constructor. Accepts a CSS selector string or an HTMLElement,
 * matching Tabulator's native behaviour so selector strings do not throw.
 */
export type TabulatorConstructor = new (
  element: string | HTMLElement,
  options: Record<string, unknown>
) => TabulatorLike;

export interface MountOptions {
  element: string | HTMLElement;
  Tabulator: TabulatorConstructor;
  columns: TableColumn[];
  data: TableRow[];
  options?: Record<string, unknown>;
}
