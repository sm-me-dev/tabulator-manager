# tabulator-manager/laravel

[![Packagist Version](https://img.shields.io/packagist/v/tabulator-manager/laravel.svg?style=flat-square&color=red)](https://packagist.org/packages/tabulator-manager/laravel)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Production-grade, database-agnostic Eloquent query pipeline, DTO request parsing, allowlisted sort/filter permissions, and presenters for Tabulator tables in Laravel 11 & 12.

## Features
- **Database-Agnostic**: Compatible with SQLite, PostgreSQL, and MySQL without dialect-specific assumptions.
- **Security & Allowlisting**: Strict column and operator validation prevents SQL injection and unauthorized queries.
- **Paginator Accuracy**: LengthAwarePaginator `$paginator->items()` returns `array` and `$paginator->getCollection()` returns `Collection`.
- **Unified Presenters**: Ready-to-use output presenters for Blade views, Inertia.js props, and REST JSON APIs.
- **Laravel Auto-Discovery**: Automatically registers `TabulatorManagerServiceProvider`.

## Installation

```bash
composer require tabulator-manager/laravel
```

## Quick Example

```php
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\RequestParser;
use TabulatorManager\Laravel\TableQueryPipeline;
use TabulatorManager\Laravel\JsonPresenter;

$definition = new TableDefinition(
    fn () => User::query(),
    [
        'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['contains', '=']],
        'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=']],
    ],
    stableOrderColumn: 'id',
    tableId: 'users'
);

$state = (new RequestParser())->parseFromRequest($request, $definition, 'users');
$result = (new TableQueryPipeline())->run($definition, $state);

return (new JsonPresenter())->present($result);
```

## Documentation
See the [Monorepo Documentation](https://github.com/tabulator-manager/tabulator-manager#readme) for the full API reference and guides.
