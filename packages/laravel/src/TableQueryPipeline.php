<?php

namespace TabulatorManager\Laravel;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use InvalidArgumentException;

/**
 * Database-agnostic query pipeline for Tabulator.
 * Supports Eloquent and Query Builder queries with allowlisted sorting,
 * filtering, and pagination.
 */
final class TableQueryPipeline
{
    /**
     * Build and paginate the query, returning the LengthAwarePaginator.
     * Guaranteed: $paginator->items() is an array, $paginator->getCollection() is a Collection.
     */
    public function paginate(TableDefinition $definition, TableStateDTO $state): LengthAwarePaginator
    {
        $query = ($definition->queryFactory)();
        if (!$query instanceof EloquentBuilder && !$query instanceof QueryBuilder) {
            throw new InvalidArgumentException(
                "Query factory must return a Laravel builder."
            );
        }

        foreach ($state->filters as $f) {
            $columnDef = $definition->columns[$f["field"]] ?? [];
            $column = $columnDef["column"] ?? null;
            $allowed = $columnDef["operators"] ?? [];
            if (!$column || !in_array($f["operator"], $allowed, true)) {
                continue;
            }
            if ($f["operator"] === "contains") {
                $query->where($column, "like", "%" . $f["value"] . "%");
            } else {
                $query->where($column, $f["operator"], $f["value"]);
            }
        }

        $sorted = false;
        foreach ($state->sort as $s) {
            $columnDef = $definition->columns[$s["field"]] ?? [];
            $column = $columnDef["column"] ?? null;
            if (
                $column &&
                ($columnDef["sortable"] ?? false)
            ) {
                $query->orderBy($column, $s["dir"]);
                $sorted = true;
            }
        }
        if (!$sorted) {
            $query->orderBy($definition->stableOrderColumn, "asc");
        }

        /** @var LengthAwarePaginator $paginator */
        $paginator = $query->paginate($state->size, ["*"], "page", $state->page);

        return $paginator;
    }

    /**
     * Execute the pipeline and return presented array with data, meta, and paginator.
     *
     * @return array{data: list<mixed>, meta: array{current_page: int, per_page: int, total: int, last_page: int}, paginator: LengthAwarePaginator}
     */
    public function run(TableDefinition $definition, TableStateDTO $state): array
    {
        $paginator = $this->paginate($definition, $state);

        return [
            "data" => $paginator->items(),
            "meta" => [
                "current_page" => $paginator->currentPage(),
                "per_page" => $paginator->perPage(),
                "total" => $paginator->total(),
                "last_page" => $paginator->lastPage(),
            ],
            "paginator" => $paginator,
        ];
    }
}
