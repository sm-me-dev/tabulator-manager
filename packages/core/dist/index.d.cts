type SortDirection = "asc" | "desc";
type FilterOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "contains";
interface SortRule {
    field: string;
    dir: SortDirection;
}
interface FilterRule {
    field: string;
    operator: FilterOperator;
    value: string;
}
interface TableState {
    page: number;
    size: number;
    sort: SortRule[];
    filters: FilterRule[];
}
declare const DEFAULT_TABLE_STATE: TableState;
interface TableColumn extends Record<string, unknown> {
    field: string;
    title: string;
}
interface TableRow extends Record<string, unknown> {
}
interface TabulatorLike {
    destroy(): void;
}
/**
 * Tabulator constructor. Accepts a CSS selector string or an HTMLElement,
 * matching Tabulator's native behaviour so selector strings do not throw.
 */
type TabulatorConstructor = new (element: string | HTMLElement, options: Record<string, unknown>) => TabulatorLike;
interface MountOptions {
    element: string | HTMLElement;
    Tabulator: TabulatorConstructor;
    columns: TableColumn[];
    data: TableRow[];
    options?: Record<string, unknown>;
}

/**
 * Read table state for a single table from a query string.
 * Only reads keys under `tm[tableId][...]`; ignores all other keys.
 */
declare function readTableState(tableId: string, search?: string): TableState;
/**
 * Write table state for a single table using non-destructive namespaced keys.
 * Only removes keys under `tm[tableId][...]`; preserves unrelated query keys
 * and other tables' `tm[otherTableId][...]` state. Never erases another
 * component's state.
 */
declare function writeTableState(tableId: string, state: TableState, mode?: "push" | "replace"): void;
/**
 * Per-table URL state adapter/coordinator. Each instance is bound to a single
 * `tableId` and only touches that table's `tm[tableId][...]` query keys.
 */
declare class UrlStateAdapter {
    private listeners;
    private readonly tableId;
    private onPop;
    constructor(tableId: string);
    current(): TableState;
    update(s: TableState, mode?: "push" | "replace"): void;
    subscribe(fn: (s: TableState) => void): () => void;
    destroy(): void;
    private emit;
}

/**
 * Mount a Tabulator instance on an element.
 *
 * The element may be a CSS selector string or an HTMLElement. When a selector
 * is given it is resolved with `document.querySelector`; a missing element
 * throws a TypeError instead of letting Tabulator fail ambiguously.
 *
 * Tabulator and any framework integration are injected by the caller; this
 * core imports neither Tabulator nor jQuery.
 */
declare function mountTable(o: MountOptions): TabulatorLike;

interface JalaliDateAdapter {
    toGregorian(jalali: string): string | null;
    toJalali(gregorianISO: string): string | null;
    format(jalali: string, options?: Intl.DateTimeFormatOptions): string;
    splitRange(value: string): [string | null, string | null];
    joinRange(from: string | null, to: string | null): string;
}
declare const RANGE_SEPARATOR = " \u062A\u0627 ";
/**
 * Normalize Persian and Arabic digits to standard ASCII digits (0-9).
 */
declare function normalizeDigits(input: string): string;
/**
 * Validate that a date string matches strict YYYY-MM-DD or YYYY/MM/DD format.
 */
declare function isValidDateFormat(value: string): boolean;
/**
 * Parse a date string into year, month, and day integers.
 */
declare function parseDateParts(value: string, strict?: boolean): {
    year: number;
    month: number;
    day: number;
} | null;
/**
 * Standard production-grade Jalali date adapter with bidirectional conversion,
 * Persian digit normalization, and range parsing.
 */
declare class StandardJalaliDateAdapter implements JalaliDateAdapter {
    toGregorian(jalali: string): string | null;
    toJalali(gregorianISO: string): string | null;
    format(jalali: string, _options?: Intl.DateTimeFormatOptions): string;
    splitRange(value: string): [string | null, string | null];
    joinRange(from: string | null, to: string | null): string;
}
/**
 * Minimal fallback adapter that operates on Jalali strings without conversion.
 * Preserves legacy fallback behaviour.
 */
declare class JalaliDateAdapterFallback implements JalaliDateAdapter {
    toGregorian(_jalali: string): string | null;
    toJalali(_gregorianISO: string): string | null;
    format(jalali: string, _options?: Intl.DateTimeFormatOptions): string;
    splitRange(value: string): [string | null, string | null];
    joinRange(from: string | null, to: string | null): string;
}

/**
 * @deprecated
 * Legacy compatibility adapter. Maps the historical
 * `new TabulatorManager(selector, url, options)` constructor pattern (used by
 * legacy Blade views) onto the new `mountTable` API.
 *
 * Scope: mount/destroy/data pass-through ONLY. Modals, plugins, formatters,
 * callbacks, and other legacy UI behaviours are NOT supported by this shim.
 * Unsupported behaviour will throw or no-op with a deprecation notice.
 *
 * This shim will be removed in a future major version. Migrate to `mountTable`
 * directly.
 */
declare class TabulatorManagerCompat {
    private instance;
    static mountTable: typeof mountTable;
    static readTableState: typeof readTableState;
    static writeTableState: typeof writeTableState;
    static UrlStateAdapter: typeof UrlStateAdapter;
    static UrlStateCoordinator: typeof UrlStateAdapter;
    static JalaliDateAdapterFallback: typeof JalaliDateAdapterFallback;
    static StandardJalaliDateAdapter: typeof StandardJalaliDateAdapter;
    static DEFAULT_TABLE_STATE: TableState;
    constructor(selector: string | HTMLElement, fetchUrl?: string, options?: Record<string, unknown>);
    destroy(): void;
}

export { DEFAULT_TABLE_STATE, type FilterOperator, type FilterRule, type JalaliDateAdapter, JalaliDateAdapterFallback, type MountOptions, RANGE_SEPARATOR, type SortDirection, type SortRule, StandardJalaliDateAdapter, type TableColumn, type TableRow, type TableState, type TabulatorConstructor, type TabulatorLike, TabulatorManagerCompat, UrlStateAdapter, UrlStateAdapter as UrlStateCoordinator, TabulatorManagerCompat as default, isValidDateFormat, mountTable, normalizeDigits, parseDateParts, readTableState, writeTableState };
