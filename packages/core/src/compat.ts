import { mountTable } from "./controller.js";
import {
  readTableState,
  writeTableState,
  UrlStateAdapter,
  UrlStateCoordinator,
} from "./url-state.js";
import { JalaliDateAdapterFallback, StandardJalaliDateAdapter } from "./jalali.js";
import { DEFAULT_TABLE_STATE } from "./types.js";
import type { TableColumn, TableRow, TabulatorConstructor } from "./types.js";

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
export class TabulatorManagerCompat {
  private instance: ReturnType<typeof mountTable> | null = null;

  static mountTable = mountTable;
  static readTableState = readTableState;
  static writeTableState = writeTableState;
  static UrlStateAdapter = UrlStateAdapter;
  static UrlStateCoordinator = UrlStateCoordinator;
  static JalaliDateAdapterFallback = JalaliDateAdapterFallback;
  static StandardJalaliDateAdapter = StandardJalaliDateAdapter;
  static DEFAULT_TABLE_STATE = DEFAULT_TABLE_STATE;

  constructor(
    selector: string | HTMLElement,
    fetchUrl?: string,
    options: Record<string, unknown> = {}
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      "[tabulator-manager] TabulatorManagerCompat is deprecated. Use mountTable() directly. This shim supports mount/destroy/data pass-through only."
    );

    const element =
      typeof selector === "string"
        ? document.querySelector<HTMLElement>(selector)
        : selector;

    if (!element || !(element instanceof HTMLElement)) {
      throw new TypeError(
        `TabulatorManager compat: container not found for selector "${String(
          selector
        )}"`
      );
    }

    const columns: TableColumn[] = Array.isArray(options.columns)
      ? (options.columns as TableColumn[])
      : [];
    const data: TableRow[] = Array.isArray(options.data)
      ? (options.data as TableRow[])
      : [];

    const globalTabulator = (window as unknown as {
      Tabulator?: unknown;
    }).Tabulator;
    if (typeof globalTabulator !== "function") {
      throw new TypeError(
        "TabulatorManager compat: a global Tabulator constructor is required."
      );
    }

    // fetchUrl is intentionally unused: the new core is data-first.
    void fetchUrl;

    this.instance = mountTable({
      element,
      Tabulator: globalTabulator as unknown as TabulatorConstructor,
      columns,
      data,
      options,
    });
  }

  destroy(): void {
    this.instance?.destroy();
    this.instance = null;
  }
}

// Install the legacy global in browser environments so existing
// `new TabulatorManager(...)` constructions keep working unchanged.
if (typeof window !== "undefined") {
  (window as unknown as { TabulatorManager?: unknown }).TabulatorManager =
    TabulatorManagerCompat;
}
