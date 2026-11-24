# Graph Report - tabulator-manager  (2026-11-24)

## Corpus Check
- 84 files · ~21,276 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .css 1, .xml 1)

## Summary
- 805 nodes · 1157 edges · 52 communities (35 shown, 17 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.87)
- Token cost: 6,124 input · 3,263 output

## Community Hubs (Navigation)
- TableDefinition
- main.ts
- PHP Package Configuration
- Node Package Configuration
- Laravel Package (`tabulator-manager/laravel`)
- TableQueryPipelineTest.php
- JalaliDateAdapterFallback
- TypeScript Configuration
- TableState
- Laravel Service Provider
- Laravel Package Testing
- tabulator-manager/laravel
- App\Models\ContractType
- Graph Data Generation
- Table Management Logic
- App\Models\LogEvent
- TableStateDTO
- handlers.ts
- steps
- demo/package.json
- laravel-demo/composer.json
- scripts
- services
- services
- compilerOptions
- 2026_01_01_000001_create_users_table.php
- mockServiceWorker.js
- app.php
- allowBuilds
- api.php
- with
- packagist-notification
- steps
- with
- mysql
- DatabaseDriversIntegrationTest.php
- Functions
- config.json
- URL State Contract Specification
- Contributing to Tabulator Manager
- Publishing & CI/CD Guide
- @tabulator-manager/core

## God Nodes (most connected - your core abstractions)
1. `TableDefinition` - 43 edges
2. `RequestParser` - 32 edges
3. `TableQueryPipeline` - 24 edges
4. `createUsersTable()` - 19 edges
5. `TableStateDTO` - 18 edges
6. `readTableState()` - 16 edges
7. `UrlStateAdapter` - 15 edges
8. `TransportCoordinator` - 14 edges
9. `with` - 13 edges
10. `StandardJalaliDateAdapter` - 13 edges

## Surprising Connections (you probably didn't know these)
- `3. Non-Destructive Invariant` --references--> `writeTableState()`  [INFERRED]
  docs/url-state-contract.md → packages/core/src/url-state.ts
- ``UrlStateAdapter` (Alias: `UrlStateCoordinator`)` --references--> `UrlStateAdapter`  [INFERRED]
  docs/api-reference.md → packages/core/src/url-state.ts
- ``TableDefinition`` --references--> `TableDefinition`  [INFERRED]
  docs/api-reference.md → packages/laravel/src/TableDefinition.php
- ``TableStateDTO`` --references--> `TableStateDTO`  [INFERRED]
  docs/api-reference.md → packages/laravel/src/TableStateDTO.php
- `Persian Digits Normalization` --references--> `normalizeDigits()`  [INFERRED]
  docs/jalali-calendar.md → packages/core/src/jalali.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Tabulator Manager Ecosystem** — packages_core_core, packages_laravel_laravel, readme_legacy_adapter [EXTRACTED 1.00]
- **SSR Hydration Pattern** — e2e_fixtures_blade_html, e2e_fixtures_inertia_html, e2e_fixtures_plain_html [INFERRED 0.90]

## Communities (52 total, 17 thin omitted)

### Community 0 - "TableDefinition"
Cohesion: 0.32
Nodes (19): RequestParser, TableDefinition, {closure#1}(), {closure#1}(), {closure#11}(), {closure#13}(), {closure#15}(), {closure#3}() (+11 more)

### Community 1 - "main.ts"
Cohesion: 0.05
Nodes (40): bootstrap(), initJalaliScenario(), initLegacyScenario(), initOrdersTable(), initTabs(), initTransportUI(), initUrlInspector(), initUsersTable() (+32 more)

### Community 2 - "PHP Package Configuration"
Cohesion: 0.05
Nodes (40): author, bugs, url, description, devDependencies, jsdom@^31.0.1, @playwright/test@^1.65.1, tsup@^8.0.0 (+32 more)

### Community 3 - "Node Package Configuration"
Cohesion: 0.05
Nodes (36): block, pestphp/pest-plugin, authors, autoload, autoload-dev, psr-4, psr-4, config (+28 more)

### Community 4 - "Laravel Package (`tabulator-manager/laravel`)"
Cohesion: 0.11
Nodes (11): Laravel Package (`tabulator-manager/laravel`), `paginate(TableDefinition $definition, TableStateDTO $state): LengthAwarePaginator`, Presenters, `RequestParser` / `TableStateParser`, `run(TableDefinition $definition, TableStateDTO $state): array`, `TableDefinition`, `TableQueryPipeline`, `TableStateDTO` (+3 more)

### Community 5 - "TableQueryPipelineTest.php"
Cohesion: 0.06
Nodes (26): Adding a Changeset, Changeset Workflow & Semantic Versioning Rules, MINOR (0.x.0), PATCH (0.0.x), Semantic Versioning Rules, Classes, `StandardJalaliDateAdapter`, `UrlStateAdapter` (Alias: `UrlStateCoordinator`) (+18 more)

### Community 6 - "JalaliDateAdapterFallback"
Cohesion: 0.13
Nodes (3): {closure#15}(), {closure#17}(), {closure#19}()

### Community 7 - "TypeScript Configuration"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+2 more)

### Community 9 - "TableState"
Cohesion: 0.36
Nodes (9): Blade SSR Consumer Fixture, ESM Consumer Fixture, Inertia SSR Consumer Fixture, Plain Script Tag Consumer Fixture, Mock Tabulator, TabulatorManager Global Bundle, TabulatorManager ESM Module, mountTable (+1 more)

### Community 10 - "Laravel Service Provider"
Cohesion: 0.22
Nodes (3): __dirname, MIME_TYPES, ROOT

### Community 12 - "tabulator-manager/laravel"
Cohesion: 0.18
Nodes (6): Documentation, Features, Installation, Quick Example, tabulator-manager/laravel, TabulatorManagerServiceProvider

### Community 14 - "Graph Data Generation"
Cohesion: 0.67
Nodes (4): @tabulator-manager/core, tabulator-manager/laravel, Legacy Global Adapter, tabulator-manager

### Community 17 - "TableStateDTO"
Cohesion: 0.20
Nodes (4): MAJOR (x.0.0), TableState, TableStateDTO, {closure#3}()

### Community 18 - "handlers.ts"
Cohesion: 0.16
Nodes (15): initMocks(), worker, handlers, jalaliAdapter, queryMockOrders(), queryMockUsers(), FIRST_NAMES, LAST_NAMES (+7 more)

### Community 19 - "steps"
Cohesion: 0.07
Nodes (28): environment, runs-on, steps, concurrency, cancel-in-progress, group, name, url (+20 more)

### Community 20 - "demo/package.json"
Cohesion: 0.09
Nodes (25): dependencies, @tabulator-manager/core@workspace:*, tabulator-tables@^6.3.0, devDependencies, autoprefixer@^10.4.20, msw@^2.7.0, postcss@^8.5.1, tailwindcss@^3.4.17 (+17 more)

### Community 21 - "laravel-demo/composer.json"
Cohesion: 0.10
Nodes (20): autoload, psr-4, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages, description (+12 more)

### Community 22 - "scripts"
Cohesion: 0.10
Nodes (21): devDependencies, @changesets/cli@^2.27.12, typescript@^5.0.0, typescript, name, private, scripts, build (+13 more)

### Community 24 - "services"
Cohesion: 0.14
Nodes (13): generateValue, key, value, services, dockerContext, dockerfilePath, env, envVars (+5 more)

### Community 25 - "services"
Cohesion: 0.14
Nodes (13): generateValue, key, value, services, dockerContext, dockerfilePath, env, envVars (+5 more)

### Community 26 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule, skipLibCheck (+4 more)

### Community 28 - "mockServiceWorker.js"
Cohesion: 0.36
Nodes (7): activeClientIds, getResponse(), handleRequest(), IS_MOCKED_RESPONSE, resolveMainClient(), respondWithMock(), sendToClient()

### Community 30 - "allowBuilds"
Cohesion: 0.40
Nodes (4): allowBuilds, esbuild, msw, packages

### Community 31 - "api.php"
Cohesion: 0.15
Nodes (10): GET /orders(), GET /users(), JsonPresenter, TableQueryPipeline, {closure#1}(), {closure#3}(), {closure#6}(), {closure#1}() (+2 more)

### Community 33 - "with"
Cohesion: 0.07
Nodes (36): name, runs-on, steps, concurrency, cancel-in-progress, group, name, runs-on (+28 more)

### Community 41 - "packagist-notification"
Cohesion: 0.06
Nodes (35): PACKAGIST_TOKEN, jobs, packagist-notification, test-suite, php, name, on, pull_request (+27 more)

### Community 42 - "steps"
Cohesion: 0.07
Nodes (31): NODE_AUTH_TOKEN, jobs, publish, test, node-version, name, on, push (+23 more)

### Community 43 - "with"
Cohesion: 0.07
Nodes (29): concurrency, GITHUB_TOKEN, NPM_TOKEN, jobs, release, name, on, push (+21 more)

### Community 44 - "mysql"
Cohesion: 0.12
Nodes (16): MYSQL_DATABASE, MYSQL_ROOT_PASSWORD, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, env, image, options (+8 more)

### Community 46 - "Functions"
Cohesion: 0.18
Nodes (10): API Reference, Functions, `isValidDateFormat(value: string): boolean`, `mountTable(options: MountOptions): TabulatorLike`, `normalizeDigits(input: string): string`, `readTableState(tableId: string, search?: string): TableState`, `TableState`, Types & Interfaces (+2 more)

### Community 47 - "config.json"
Cohesion: 0.20
Nodes (9): access, baseBranch, changelog, commit, fixed, ignore, linked, $schema (+1 more)

### Community 48 - "URL State Contract Specification"
Cohesion: 0.20
Nodes (9): 1. Namespace Hierarchy, 2. Multi-Table Isolation, 3. Non-Destructive Invariant, 4. Allowlisted Sort & Filter Codecs, 5. Pagination Ownership Principle, Clamping & Validation, Example URL, Permitted Filter Operators (+1 more)

### Community 49 - "Contributing to Tabulator Manager"
Cohesion: 0.22
Nodes (8): Adding a Changeset, Contributing to Tabulator Manager, Conventional Commits & Changesets, Development Environment Setup, Installation, Local Demo Showcase, Prerequisites, Testing & Verification

### Community 50 - "Publishing & CI/CD Guide"
Cohesion: 0.22
Nodes (8): 1. NPM Trusted Publishing & Cryptographic Provenance, 2. Packagist & Composer Publishing, 3. Automated Release Lifecycle, Automated Webhook Integration, How It Works, Publishing & CI/CD Guide, Registering on Packagist, Setting Up Trusted Publishing on npmjs.com

### Community 51 - "@tabulator-manager/core"
Cohesion: 0.33
Nodes (5): Documentation, Features, Installation, Quick Example, @tabulator-manager/core

## Knowledge Gaps
- **4 isolated node(s):** `Legacy Global Adapter`, `graphify`, `graphify-out/graph.json`, `Mock Tabulator`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 429 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Semantic Versioning Rules` connect `TableQueryPipelineTest.php` to `TableStateDTO`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TableDefinition` (e.g. with `MAJOR (x.0.0)` and ``TableDefinition``) actually correct?**
  _`TableDefinition` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Legacy Global Adapter`, `graphify`, `graphify-out/graph.json` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053703703703703705 - nodes in this community are weakly interconnected._
- **Why does `MINOR (0.x.0)` connect `TableQueryPipelineTest.php` to `main.ts`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TableQueryPipeline` (e.g. with `MAJOR (x.0.0)` and ``TableQueryPipeline``) actually correct?**
  _`TableQueryPipeline` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `PHP Package Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.04810360777058279 - nodes in this community are weakly interconnected._