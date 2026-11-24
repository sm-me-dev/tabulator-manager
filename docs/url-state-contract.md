# URL State Contract Specification

The Tabulator Manager URL state protocol defines a strict, non-destructive, and deterministic standard for synchronizing data table state with the browser address bar.

---

## 1. Namespace Hierarchy

All parameters managed by Tabulator Manager are namespaced under the root prefix `tm` (configurable in Laravel via `tabulator-manager.query_key`) followed by the unique `tableId`:

```
tm[<tableId>][page]=<int>
tm[<tableId>][size]=<int>
tm[<tableId>][sort][<index>][field]=<string>
tm[<tableId>][sort][<index>][dir]=asc|desc
tm[<tableId>][filters][<index>][field]=<string>
tm[<tableId>][filters][<index>][operator]=<operator>
tm[<tableId>][filters][<index>][value]=<string>
```

### Example URL
```
https://app.example.com/dashboard?view=compact&tm[users][page]=2&tm[users][size]=25&tm[users][sort][0][field]=score&tm[users][sort][0][dir]=desc&tm[orders][page]=1#activity
```

---

## 2. Multi-Table Isolation

Multiple tables coexisting on the same web page operate with complete independence.

When `UrlStateAdapter("users")` updates its state:
1. It queries the current URL.
2. It isolates and removes only query parameters matching `tm[users][`.
3. It rewrites the updated state for `users`.
4. Parameters belonging to other tables (such as `tm[orders][...]`) are left intact.

---

## 3. Non-Destructive Invariant

`writeTableState()` enforces two strict guarantees:
1. **External Query Parameters**: Any query parameters outside the active table prefix (e.g. `theme=dark`, `tab=billing`, `utm_medium=email`) are preserved untouched.
2. **Anchor Hashes**: The hash fragment (e.g. `#results`, `#user-profile`) is preserved across all `history.pushState` and `history.replaceState` transitions.

---

## 4. Allowlisted Sort & Filter Codecs

### Permitted Filter Operators
| Operator | Description | Supported Types |
| :--- | :--- | :--- |
| `=` | Exact match | Numeric, String, Date |
| `!=` | Inequality | Numeric, String, Date |
| `>` | Greater than | Numeric, Date |
| `>=` | Greater than or equal | Numeric, Date |
| `<` | Less than | Numeric, Date |
| `<=` | Less than or equal | Numeric, Date |
| `contains` | Substring match (`LIKE %value%`) | String |

### Clamping & Validation
- **Page**: Clamped to `Math.max(1, Math.floor(page))`.
- **Page Size**: Clamped between `1` and `100` (configurable via `maxPageSize`).
- **Sort Direction**: Only lowercase `asc` or `desc` are accepted. Any other value is dropped.
- **Maximum Rules**: Max 20 sort rules and 50 filter rules per table to guard against query inflation attacks.

---

## 5. Pagination Ownership Principle

Server-side pagination is **authoritative**:
- The client table requests page $N$ of size $S$.
- The backend pipeline returns the paginated slice and total record count.
- The client table must **never** re-paginate or locally slice a server-supplied response.
- Response contract:
  ```json
  {
    "data": [ /* records */ ],
    "meta": {
      "current_page": 2,
      "per_page": 25,
      "total": 140,
      "last_page": 6
    }
  }
  ```
