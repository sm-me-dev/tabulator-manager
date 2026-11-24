import type { MountOptions, TabulatorLike } from "./types.js";

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
export function mountTable(o: MountOptions): TabulatorLike {
  const el =
    typeof o.element === "string"
      ? document.querySelector<HTMLElement>(o.element)
      : o.element;

  if (!(el instanceof HTMLElement)) {
    throw new TypeError(
      `Tabulator container element not found or not an HTMLElement: ${String(
        o.element
      )}`
    );
  }

  return new o.Tabulator(el, {
    ...(o.options ?? {}),
    columns: o.columns,
    data: o.data,
  });
}
