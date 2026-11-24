# API Reference

Complete API specification for `@tabulator-manager/core` (TypeScript) and `tabulator-manager/laravel` (PHP).

---

## TypeScript Core (`@tabulator-manager/core`)

### Types & Interfaces

#### `TableState`
```typescript
interface TableState {
  page: number;
  size: number;
  sort: SortRule[];
  filters: FilterRule[];
}

interface SortRule {
  field: string;
  dir: "asc" | "desc";
}

interface FilterRule {
  field: string;
  operator: "=" | "!=" | ">" | ">=" | "<" | "<=" | "contains";
  value: string;
}

interface MountOptions {
  element: string | HTMLElement;
  Tabulator: TabulatorConstructor;
  columns?: TableColumn[];
  data?: TableRow[];
  options?: Record<string, unknown>;
}
```

---

### Functions

#### `mountTable(options: MountOptions): TabulatorLike`
Mounts a Tabulator instance onto a DOM element or selector string.
- If `element` is a string, it is resolved via `document.querySelector`. Throws `TypeError` if not found.
- Caller injects the `Tabulator` constructor, avoiding vendor lock-in.

#### `readTableState(tableId: string, search?: string): TableState`
Parses query parameters strictly namespaced under `tm[tableId][...]`.
- Defaults to `window.location.search` when `search` is omitted.
- Automatically handles trailing hash anchors and non-tabulator parameters.
- Clamps `page` to minimum `1` and `size` between `1` and `100`.

#### `writeTableState(tableId: string, state: TableState, mode?: "push" | "replace"): void`
Serializes `TableState` into URL search parameters.
- Strictly removes and rewrites only keys starting with `tm[tableId][`.
- **Non-destructive**: Preserves all query parameters belonging to other tables, unrelated query keys (e.g. `utm_source`, `view`), and `#anchor` hashes.
- Dispatches `window.history.pushState` or `replaceState`.

#### `normalizeDigits(input: string): string`
Converts Persian digits (`۰۱۲۳۴۵۶۷۸۹`) and Arabic digits (`٠١٢٣٤٥٦٧٨٩`) into standard ASCII digits (`0123456789`).

#### `isValidDateFormat(value: string): boolean`
Validates that a string matches the strict format contract `YYYY-MM-DD` or `YYYY/MM/DD`.

---

### Classes

#### `UrlStateAdapter` (Alias: `UrlStateCoordinator`)
Per-table state manager bound to a single `tableId`.

- `constructor(tableId: string)`: Registers a `popstate` listener in browser environments.
- `current(): TableState`: Returns the current table state from `window.location.search`.
- `update(state: TableState, mode: "push" | "replace" = "replace"): void`: Writes state to URL and notifies subscribers.
- `subscribe(fn: (s: TableState) => void): () => void`: Subscribes to state updates. Returns an unsubscribe function.
- `destroy(): void`: Cleans up window event listeners.

#### `StandardJalaliDateAdapter`
Production-grade date adapter implementing `JalaliDateAdapter`:
- `toGregorian(jalali: string): string | null`: Converts Jalali date string (`jYYYY/jMM/jDD` or `jYYYY-jMM-jDD`) to Gregorian ISO (`YYYY-MM-DD`). Returns `null` on invalid dates.
- `toJalali(gregorianISO: string): string | null`: Converts Gregorian ISO date (`YYYY-MM-DD`) to Jalali date string (`jYYYY/jMM/jDD`).
- `format(jalali: string, options?: Intl.DateTimeFormatOptions): string`: Formats date string with normalized digits and padding (`YYYY/MM/DD`).
- `splitRange(value: string): [string | null, string | null]`: Splits a range string (`"from تا to"`) into two date strings.
- `joinRange(from: string | null, to: string | null): string`: Joins two dates using `" تا "`.

#### `TabulatorManagerCompat` (`@deprecated`)
Backward-compatibility adapter for legacy Blade views.
- `constructor(selector: string | HTMLElement, fetchUrl?: string, options?: Record<string, unknown>)`: Maps legacy construction calls to `mountTable`.
- `destroy(): void`: Destroys the underlying Tabulator instance.

---

## Laravel Package (`tabulator-manager/laravel`)

### `TableDefinition`
Defines the server-side contract, allowlisted columns, and SQL boundaries.

```php
new TableDefinition(
    callable|Closure $queryFactory,
    array $columns,
    string $stableOrderColumn,
    int $defaultPageSize = 20,
    int $maxPageSize = 100,
    ?string $tableId = null
);
```

- `$columns`: Mapping of logical field name to configuration:
  ```php
  'name' => [
      'column' => 'name', // Physical database column
      'sortable' => true,
      'operators' => ['contains', '=']
  ]
  ```
- `$stableOrderColumn`: Fallback column ensuring deterministic pagination (e.g. `'id'`).
- Identifier validation: Throws `InvalidArgumentException` on unsafe identifiers to prevent SQL injection.

---

### `TableStateDTO`
Immutable data transfer object representing client request state:

```php
class TableStateDTO
{
    public readonly int $page;
    public readonly int $size;
    public readonly array $sort;    // list<array{field:string, dir:string}>
    public readonly array $filters; // list<array{field:string, operator:string, value:string}>
}
```

---

### `RequestParser` / `TableStateParser`
Parses incoming requests against allowlisted table definitions.

- `parseFromRequest(Request $request, TableDefinition $definition, ?string $tableId = null): TableStateDTO`
- `parseFromQuery(array $query, TableDefinition $definition, ?string $tableId = null): TableStateDTO`

Only fields explicitly declared in `$definition->columns` with matching allowed operators and directions (`asc`, `desc`) are accepted. Malformed parameters or unauthorized fields are silently ignored.

---

### `TableQueryPipeline`
Executes filtering, sorting, and pagination across Eloquent or Query Builder instances.

#### `paginate(TableDefinition $definition, TableStateDTO $state): LengthAwarePaginator`
Builds and paginates the query. Guaranteed:
- `$paginator->items()` returns `array`.
- `$paginator->getCollection()` returns `Illuminate\Support\Collection`.

#### `run(TableDefinition $definition, TableStateDTO $state): array`
Executes the pipeline and returns a structured array:
```php
[
    'data' => $paginator->items(),
    'meta' => [
        'current_page' => 1,
        'per_page' => 20,
        'total' => 150,
        'last_page' => 8,
    ],
    'paginator' => $paginator,
]
```

---

### Presenters

- **`JsonPresenter`**:
  ```php
  $presenter->present(array $result): \Illuminate\Http\JsonResponse
  // Returns HTTP 200 with { data: [...], meta: { current_page, per_page, total, last_page } }
  ```
- **`BladePresenter`**:
  ```php
  $presenter->present(array $result): array
  // Returns raw array for template hydration without redundant initial fetch
  ```
- **`InertiaPresenter`**:
  ```php
  $presenter->present(string $component, array $result, array $additional = []): \Inertia\Response
  // Renders Inertia page with 'table' prop
  ```
