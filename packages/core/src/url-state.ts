import {
  DEFAULT_TABLE_STATE,
  type FilterOperator,
  type TableState,
} from "./types.js";

const ROOT = "tm";
const OPS = new Set<FilterOperator>([
  "=",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
  "contains",
]);

function positiveInt(v: string | null, fallback: number): number {
  if (!v || !/^\d+$/.test(v)) return fallback;
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0 ? n : fallback;
}

/** Prefix used for a single table's namespaced query keys. */
function tablePrefix(tableId: string): string {
  return `${ROOT}[${tableId}]`;
}

/**
 * Read table state for a single table from a query string.
 * Only reads keys under `tm[tableId][...]`; ignores all other keys.
 */
export function readTableState(
  tableId: string,
  search?: string
): TableState {
  let searchStr =
    search ?? (typeof window !== "undefined" ? window.location.search : "");
  if (searchStr.includes("#")) {
    searchStr = searchStr.slice(0, searchStr.indexOf("#"));
  }
  if (searchStr.includes("?")) {
    searchStr = searchStr.slice(searchStr.indexOf("?"));
  }
  const p = new URLSearchParams(searchStr);
  const prefix = `${tablePrefix(tableId)}[`;
  const s: TableState = {
    page: positiveInt(p.get(`${prefix}page]`), 1),
    size: Math.min(100, positiveInt(p.get(`${prefix}size]`), 20)),
    sort: [],
    filters: [],
  };

  for (let i = 0; i < 20; i++) {
    const field = p.get(`${prefix}sort][${i}][field]`);
    const dir = p.get(`${prefix}sort][${i}][dir]`);
    if (field && (dir === "asc" || dir === "desc")) {
      s.sort.push({ field, dir });
    }
  }

  // Also support single unindexed sort rule: tm[tableId][sort][field]=...&tm[tableId][sort][dir]=...
  if (s.sort.length === 0) {
    const singleField = p.get(`${prefix}sort][field]`);
    const singleDir = p.get(`${prefix}sort][dir]`);
    if (singleField && (singleDir === "asc" || singleDir === "desc")) {
      s.sort.push({ field: singleField, dir: singleDir });
    }
  }

  for (let i = 0; i < 50; i++) {
    const field = p.get(`${prefix}filters][${i}][field]`);
    const op = p.get(
      `${prefix}filters][${i}][operator]`
    ) as FilterOperator | null;
    const value = p.get(`${prefix}filters][${i}][value]`);
    if (field && op && OPS.has(op) && value !== null) {
      s.filters.push({ field, operator: op, value });
    }
  }

  return s;
}

/**
 * Write table state for a single table using non-destructive namespaced keys.
 * Only removes keys under `tm[tableId][...]`; preserves unrelated query keys
 * and other tables' `tm[otherTableId][...]` state. Never erases another
 * component's state.
 */
export function writeTableState(
  tableId: string,
  state: TableState,
  mode: "push" | "replace" = "replace"
): void {
  const url = new URL(
    typeof window !== "undefined" ? window.location.href : "http://localhost/"
  );
  const prefix = `${tablePrefix(tableId)}[`;

  // Find all keys starting with table prefix across URLSearchParams (handles both encoded and decoded)
  const keysToDelete = new Set<string>();
  url.searchParams.forEach((_, k) => {
    // URLSearchParams already yields decoded keys; calling decodeURIComponent()
    // again would throw URIError for any unrelated key containing a literal "%".
    if (k.startsWith(prefix)) {
      keysToDelete.add(k);
    }
  });
  for (const k of keysToDelete) {
    url.searchParams.delete(k);
  }

  url.searchParams.set(
    `${prefix}page]`,
    String(Math.max(1, Math.floor(state.page)))
  );
  url.searchParams.set(
    `${prefix}size]`,
    String(Math.min(100, Math.max(1, Math.floor(state.size))))
  );
  state.sort.forEach((x, i) => {
    url.searchParams.set(`${prefix}sort][${i}][field]`, x.field);
    url.searchParams.set(`${prefix}sort][${i}][dir]`, x.dir);
  });
  state.filters.forEach((x, i) => {
    url.searchParams.set(`${prefix}filters][${i}][field]`, x.field);
    url.searchParams.set(`${prefix}filters][${i}][operator]`, x.operator);
    url.searchParams.set(`${prefix}filters][${i}][value]`, x.value);
  });

  if (typeof window !== "undefined" && window.history) {
    window.history[mode === "push" ? "pushState" : "replaceState"](
      {},
      "",
      url.toString()
    );
  }
}

/**
 * Per-table URL state adapter/coordinator. Each instance is bound to a single
 * `tableId` and only touches that table's `tm[tableId][...]` query keys.
 */
export class UrlStateAdapter {
  private listeners = new Set<(s: TableState) => void>();
  private readonly tableId: string;
  private onPop = () => this.emit(readTableState(this.tableId));

  constructor(tableId: string) {
    this.tableId = tableId;
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.onPop);
    }
  }

  current(): TableState {
    return readTableState(this.tableId);
  }

  update(s: TableState, mode: "push" | "replace" = "replace"): void {
    writeTableState(this.tableId, s, mode);
    this.emit(s);
  }

  subscribe(fn: (s: TableState) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", this.onPop);
    }
    this.listeners.clear();
  }

  private emit(s: TableState): void {
    this.listeners.forEach((fn) => fn(s));
  }
}

export { UrlStateAdapter as UrlStateCoordinator };
