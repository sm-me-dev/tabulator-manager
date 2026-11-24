<?php

namespace TabulatorManager\Laravel;

/**
 * @param list<array{field:string,dir:string}> $sort
 * @param list<array{field:string,operator:string,value:string}> $filters
 */
class TableStateDTO
{
    public function __construct(
        public readonly int $page,
        public readonly int $size,
        public readonly array $sort,
        public readonly array $filters
    ) {}
}
