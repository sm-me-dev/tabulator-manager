<?php

namespace TabulatorManager\Laravel;

final class TableStateParser
{
    private const OPS = ["=", "!=", ">", ">=", "<", "<=", "contains"];

    /**
     * @param array<string, mixed> $input
     * @return TableStateDTO
     */
    public function parse(array $input, TableDefinition $definition, ?string $tableId = null): TableStateDTO
    {
        $rootKey = config("tabulator-manager.query_key", "tm");
        $rawRoot = $input[$rootKey] ?? [];
        if (!is_array($rawRoot)) {
            $rawRoot = [];
        }

        $id = $tableId ?? $definition->tableId;
        if ($id !== null && isset($rawRoot[$id]) && is_array($rawRoot[$id])) {
            $raw = $rawRoot[$id];
        } elseif (isset($rawRoot["page"]) || isset($rawRoot["size"]) || isset($rawRoot["sort"]) || isset($rawRoot["filters"])) {
            $raw = $rawRoot;
        } elseif ($id !== null) {
            $raw = [];
        } elseif (count($rawRoot) === 1 && is_array(reset($rawRoot)) && !isset($rawRoot["page"])) {
            $raw = reset($rawRoot);
        } else {
            $raw = $rawRoot;
        }

        $page = filter_var($raw["page"] ?? 1, FILTER_VALIDATE_INT);
        $size = filter_var(
            $raw["size"] ?? $definition->defaultPageSize,
            FILTER_VALIDATE_INT
        );
        $page = is_int($page) && $page > 0 ? $page : 1;
        $size = is_int($size) && $size > 0
            ? min($size, $definition->maxPageSize)
            : $definition->defaultPageSize;

        $sort = [];
        foreach (
            array_slice(
                is_array($raw["sort"] ?? null) ? $raw["sort"] : [],
                0,
                20
            ) as $item
        ) {
            if (!is_array($item) || !is_string($item["field"] ?? null)) {
                continue;
            }
            $field = $item["field"];
            $dir = strtolower((string) ($item["dir"] ?? ""));
            $columnDef = $definition->columns[$field] ?? null;
            if (
                $columnDef !== null &&
                ($columnDef["sortable"] ?? false) &&
                in_array($dir, ["asc", "desc"], true)
            ) {
                $sort[] = ["field" => $field, "dir" => $dir];
            }
        }

        $filters = [];
        foreach (
            array_slice(
                is_array($raw["filters"] ?? null) ? $raw["filters"] : [],
                0,
                50
            ) as $item
        ) {
            if (!is_array($item) || !is_string($item["field"] ?? null)) {
                continue;
            }
            $field = $item["field"];
            $op = (string) ($item["operator"] ?? "");
            $value = $item["value"] ?? null;
            $columnDef = $definition->columns[$field] ?? null;
            $allowed = $columnDef !== null ? ($columnDef["operators"] ?? []) : [];
            if (
                $columnDef !== null &&
                in_array($op, self::OPS, true) &&
                in_array($op, $allowed, true) &&
                (is_string($value) || is_numeric($value))
            ) {
                $filters[] = [
                    "field" => $field,
                    "operator" => $op,
                    "value" => (string) $value,
                ];
            }
        }

        return new TableStateDTO($page, $size, $sort, $filters);
    }
}
