# @tabulator-manager/core

[![npm version](https://img.shields.io/npm/v/@tabulator-manager/core.svg?style=flat-square&color=indigo)](https://www.npmjs.com/package/@tabulator-manager/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Transport-agnostic, non-destructive per-table URL state coordinator, Jalali calendar adapter, and Tabulator controller.

## Features
- **Strictly Namespaced URL State**: Syncs state to `tm[tableId][page|size|sort|filters]` without clobbering other tables, external query params, or anchor hashes.
- **Authoritative Server Pagination**: Guaranteed zero client-side re-pagination of server-supplied slices.
- **Jalali Date Adapter**: Bidirectional conversion between Gregorian ISO (`YYYY-MM-DD`) and Jalali (`YYYY/MM/DD`), date range parsing (`" تا "`), and Persian/Arabic digits normalization (`۰-۹`).
- **Flexible Mount Controller**: Accepts `string | HTMLElement`.
- **Legacy Shim**: `window.TabulatorManager` mapping historical constructor patterns to `mountTable`.
- **Multiple Bundling Formats**: Clean ESM (`dist/index.mjs`), CommonJS (`dist/index.cjs`), and IIFE (`dist/index.global.js`) with complete `.d.ts` declarations.

## Installation

```bash
pnpm add @tabulator-manager/core tabulator-tables
```

## Quick Example

```typescript
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { mountTable, UrlStateAdapter } from "@tabulator-manager/core";

const adapter = new UrlStateAdapter("users");
const table = mountTable({
  element: "#users-table",
  Tabulator,
  columns: [
    { title: "ID", field: "id" },
    { title: "Name", field: "name", headerSort: true },
  ],
  options: {
    pagination: true,
    paginationMode: "remote",
    ajaxURL: "/api/users",
  },
});
```

## Documentation
See the [Monorepo Documentation](https://github.com/tabulator-manager/tabulator-manager#readme) for the full API reference and examples.
