<?php

namespace TabulatorManager\Laravel;

use Illuminate\Http\Request;

/**
 * Parses an incoming HTTP request into a TableStateDTO using the table's
 * allowlisted column definitions. Every client-supplied field is mapped
 * through TableDefinition before being accepted.
 */
final class RequestParser
{
    private TableStateParser $parser;

    public function __construct()
    {
        $this->parser = new TableStateParser();
    }

    /**
     * @param array<string, mixed> $query
     * @return TableStateDTO
     */
    public function parseFromQuery(array $query, TableDefinition $definition, ?string $tableId = null): TableStateDTO
    {
        return $this->parser->parse($query, $definition, $tableId);
    }

    public function parseFromRequest(Request $request, TableDefinition $definition, ?string $tableId = null): TableStateDTO
    {
        $query = $request->query();
        if (!is_array($query)) {
            $query = $request->query->all();
        }
        return $this->parseFromQuery($query, $definition, $tableId);
    }
}
