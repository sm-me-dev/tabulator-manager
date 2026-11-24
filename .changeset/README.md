# Changeset Workflow & Semantic Versioning Rules

This monorepo adheres strictly to [Semantic Versioning 2.0.0](https://semver.org/) and Conventional Commits.

## Semantic Versioning Rules

### MAJOR (x.0.0)
Breaking changes require a major version increment. Examples:
- Altering the URL query state contract (`tm[tableId][...]` namespace or keys).
- Modifying signatures of public DTOs (`TableStateDTO`), `TableDefinition`, or `TableQueryPipeline`.
- Removing deprecated APIs (e.g. `window.TabulatorManager` compat shim or `TableState` alias).
- Bumping minimum required PHP or Node runtime versions.

### MINOR (0.x.0)
Backwards-compatible feature additions require a minor version increment. Examples:
- Adding a new date adapter (e.g. alternative calendar systems).
- Adding new query filter operators (e.g. `between`, `in`, `starts_with`).
- Introducing new presenters (e.g. GraphQL or custom JSON:API).
- Adding new helper methods to `UrlStateAdapter` or `JalaliDateAdapter`.

### PATCH (0.0.x)
Backwards-compatible bug fixes and internal refactorings require a patch increment. Examples:
- Fixing query string regex or parser boundary conditions.
- Clamping edge cases (e.g. negative page numbers or excessive page sizes).
- Optimizing query grammar generation or dependency updates.

---

## Adding a Changeset

When submitting a pull request that changes code in `@tabulator-manager/core` or `tabulator-manager/laravel`:

```bash
pnpm changeset
```

Follow the prompts to select the affected package(s) and specify the semver bump type (patch, minor, major) along with a summary description. Commit the generated markdown file in `.changeset/`.
