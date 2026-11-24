<?php

namespace TabulatorManager\Laravel;

use Closure;
use InvalidArgumentException;

final class TableDefinition
{
    /**
     * @param callable $queryFactory
     * @param array<string, array{column:string, sortable?:bool, operators?:list<string>}> $columns
     */
    public function __construct(
        public Closure $queryFactory,
        public readonly array $columns,
        public readonly string $stableOrderColumn,
        public readonly int $defaultPageSize = 20,
        public readonly int $maxPageSize = 100,
        public readonly ?string $tableId = null
    ) {
        $this->queryFactory = Closure::fromCallable($queryFactory);
        if ($defaultPageSize < 1 || $maxPageSize < $defaultPageSize) {
            throw new InvalidArgumentException("Invalid page-size limits.");
        }
        foreach ($columns as $name => $definition) {
            if (!is_string($name) || !isset($definition["column"])) {
                throw new InvalidArgumentException("Each field needs a physical column.");
            }
            self::assertIdentifier($definition["column"]);
        }
        self::assertIdentifier($stableOrderColumn);
    }

    public static function assertIdentifier(string $value): void
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/', $value)) {
            throw new InvalidArgumentException("Unsafe database identifier.");
        }
    }
}
