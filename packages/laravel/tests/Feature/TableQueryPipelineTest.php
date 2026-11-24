<?php

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use TabulatorManager\Laravel\RequestParser;
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\TableQueryPipeline;
use TabulatorManager\Laravel\TableStateDTO;

uses(\Tests\TestCase::class);

it('paginates with bound values and allowlisted columns', function () {
    createUsersTable();
    seedUsers(array_fill(0, 25, ['name' => 'User', 'active' => 1]));

    $definition = new TableDefinition(
        fn () => DB::table('users')->where('active', 1),
        [
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['contains', '=']],
            'email' => ['column' => 'email', 'sortable' => true, 'operators' => ['contains', '=']],
        ],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();

    $state = $parser->parseFromQuery(
        ['tm' => ['page' => 1, 'size' => 10]],
        $definition
    );

    $result = $pipeline->run($definition, $state);

    expect($result['data'])->toHaveCount(10);
    expect($result['meta']['current_page'])->toBe(1);
    expect($result['meta']['per_page'])->toBe(10);
    expect($result['meta']['total'])->toBe(25);
    expect($result['meta']['last_page'])->toBe(3);
    expect(is_array($result['data']))->toBeTrue();
});

it('ensures LengthAwarePaginator items() returns array and getCollection() returns Collection', function () {
    createUsersTable();
    seedUsers([
        ['name' => 'Alice', 'active' => 1],
        ['name' => 'Bob', 'active' => 1],
    ]);

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id'
    );

    $state = new TableStateDTO(1, 10, [], []);
    $pipeline = new TableQueryPipeline();

    $paginator = $pipeline->paginate($definition, $state);
    expect($paginator)->toBeInstanceOf(LengthAwarePaginator::class);
    expect(is_array($paginator->items()))->toBeTrue();
    expect($paginator->getCollection())->toBeInstanceOf(Collection::class);

    $result = $pipeline->run($definition, $state);
    expect(is_array($result['data']))->toBeTrue();
    expect($result['paginator']->getCollection())->toBeInstanceOf(Collection::class);
});

it('applies allowlisted filters with bound values', function () {
    createUsersTable();
    seedUsers([
        ['name' => 'Alice Smith', 'active' => 1],
        ['name' => 'Bob Jones', 'active' => 1],
        ['name' => 'Charlie Brown', 'active' => 0],
    ]);

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        [
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['contains']],
            'active' => ['column' => 'active', 'sortable' => true, 'operators' => ['=']],
        ],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();

    $state = $parser->parseFromQuery(
        [
            'tm' => [
                'filters' => [
                    ['field' => 'name', 'operator' => 'contains', 'value' => 'Smith'],
                ],
            ],
        ],
        $definition
    );

    $result = $pipeline->run($definition, $state);

    expect($result['data'])->toHaveCount(1);
    expect($result['data'][0]->name)->toBe('Alice Smith');
});

it('rejects filters on fields without the operator allowed', function () {
    createUsersTable();
    seedUsers([
        ['name' => 'Alice', 'active' => 1],
        ['name' => 'Bob', 'active' => 1],
    ]);

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        [
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']],
        ],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();

    $state = $parser->parseFromQuery(
        [
            'tm' => [
                'filters' => [
                    ['field' => 'name', 'operator' => 'contains', 'value' => 'x'],
                ],
            ],
        ],
        $definition
    );

    expect($state->filters)->toBe([]);

    $result = $pipeline->run($definition, $state);
    expect($result['data'])->toHaveCount(2);
});

it('applies stable order column when no sort specified', function () {
    createUsersTable();
    seedUsers([
        ['name' => 'Zack', 'active' => 1],
        ['name' => 'Amy', 'active' => 1],
    ]);

    $definition = new TableDefinition(
        fn () => DB::table('users')->where('active', 1),
        [
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']],
        ],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();

    $state = $parser->parseFromQuery(
        ['tm' => ['page' => 1, 'size' => 10]],
        $definition
    );

    $result = $pipeline->run($definition, $state);

    expect($result['data'])->toHaveCount(2);
    $ids = array_column($result['data'], 'id');
    sort($ids);
    expect(array_column($result['data'], 'id'))->toEqual($ids);
});

it('applies sort from state', function () {
    createUsersTable();
    seedUsers([
        ['name' => 'Zack', 'active' => 1],
        ['name' => 'Amy', 'active' => 1],
    ]);

    $definition = new TableDefinition(
        fn () => DB::table('users')->where('active', 1),
        [
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']],
        ],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();

    $state = $parser->parseFromQuery(
        [
            'tm' => [
                'sort' => [['field' => 'name', 'dir' => 'asc']],
            ],
        ],
        $definition
    );

    $result = $pipeline->run($definition, $state);

    $names = array_column($result['data'], 'name');
    expect($names[0])->toBe('Amy');
    expect($names[count($names) - 1])->toBe('Zack');
});

it('throws on invalid query factory', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => 'not-a-builder',
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();

    $state = $parser->parseFromQuery(['tm' => ['page' => 1]], $definition);

    expect(fn () => $pipeline->run($definition, $state))
        ->toThrow(\InvalidArgumentException::class);
});

it('validates database identifiers to prevent SQL injection', function () {
    expect(fn () => new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'name; DROP TABLE users;--', 'sortable' => true]],
        'id'
    ))->toThrow(\InvalidArgumentException::class);

    expect(fn () => new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'name', 'sortable' => true]],
        'id; DROP TABLE users;--'
    ))->toThrow(\InvalidArgumentException::class);
});
