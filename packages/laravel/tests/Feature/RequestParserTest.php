<?php

use Illuminate\Support\Facades\DB;
use TabulatorManager\Laravel\RequestParser;
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\TableStateDTO;

uses(\Tests\TestCase::class);

it('parses valid page and size from query', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'users.name', 'sortable' => true, 'operators' => ['=']]],
        'users.id'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromQuery(
        ['tm' => ['page' => 3, 'size' => 50]],
        $definition
    );

    expect($state)->toBeInstanceOf(TableStateDTO::class);
    expect($state->page)->toBe(3);
    expect($state->size)->toBe(50);
});

it('clamps page to minimum 1', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'users.name', 'sortable' => true, 'operators' => ['=']]],
        'users.id'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromQuery(
        ['tm' => ['page' => 0, 'size' => 20]],
        $definition
    );

    expect($state->page)->toBe(1);
});

it('clamps size to max and min', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'users.name', 'sortable' => true, 'operators' => ['=']]],
        'users.id',
        defaultPageSize: 20,
        maxPageSize: 100
    );

    $parser = new RequestParser();
    $state = $parser->parseFromQuery(
        ['tm' => ['page' => 1, 'size' => 999]],
        $definition
    );

    expect($state->size)->toBe(100);

    $state = $parser->parseFromQuery(
        ['tm' => ['page' => 1, 'size' => 0]],
        $definition
    );

    expect($state->size)->toBe(20);
});

it('allows only defined sortable fields with valid directions', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        [
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']],
            'email' => ['column' => 'email', 'sortable' => false, 'operators' => ['=']],
        ],
        'id'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromQuery(
        [
            'tm' => [
                'sort' => [
                    ['field' => 'name', 'dir' => 'asc'],
                    ['field' => 'email', 'dir' => 'desc'],
                    ['field' => 'name', 'dir' => 'invalid'],
                ],
            ],
        ],
        $definition
    );

    expect($state->sort)->toHaveCount(1);
    expect($state->sort[0])->toBe(['field' => 'name', 'dir' => 'asc']);
});

it('allows only defined operators per field', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        [
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=', 'contains']],
            'price' => ['column' => 'price', 'sortable' => true, 'operators' => ['>=', '<=']],
        ],
        'id'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromQuery(
        [
            'tm' => [
                'filters' => [
                    ['field' => 'name', 'operator' => '=', 'value' => 'john'],
                    ['field' => 'name', 'operator' => '>=', 'value' => '5'],
                    ['field' => 'price', 'operator' => '>=', 'value' => '100'],
                    ['field' => 'price', 'operator' => 'invalid', 'value' => 'x'],
                    ['field' => 'nonexistent', 'operator' => '=', 'value' => 'x'],
                ],
            ],
        ],
        $definition
    );

    expect($state->filters)->toHaveCount(2);
    expect($state->filters[0])->toBe(['field' => 'name', 'operator' => '=', 'value' => 'john']);
    expect($state->filters[1])->toBe(['field' => 'price', 'operator' => '>=', 'value' => '100']);
});

it('rejects empty query gracefully', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromQuery([], $definition);

    expect($state->page)->toBe(1);
    expect($state->size)->toBe(20);
    expect($state->sort)->toBe([]);
    expect($state->filters)->toBe([]);
});

it('rejects malformed tm key gracefully', function () {
    createUsersTable();

    $definition = new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromQuery(
        ['tm' => 'not-an-array'],
        $definition
    );

    expect($state->page)->toBe(1);
    expect($state->size)->toBe(20);
});

it('parses namespaced tm[tableId] query independently for multiple tables', function () {
    createUsersTable();

    $usersDef = new TableDefinition(
        fn () => DB::table('users'),
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id',
        tableId: 'users'
    );

    $ordersDef = new TableDefinition(
        fn () => DB::table('orders'),
        ['price' => ['column' => 'price', 'sortable' => true, 'operators' => ['>=']]],
        'id',
        tableId: 'orders'
    );

    $parser = new RequestParser();
    $query = [
        'tm' => [
            'users' => [
                'page' => 2,
                'size' => 25,
                'sort' => [['field' => 'name', 'dir' => 'asc']],
            ],
            'orders' => [
                'page' => 5,
                'size' => 50,
                'filters' => [['field' => 'price', 'operator' => '>=', 'value' => '99']],
            ],
        ],
    ];

    $usersState = $parser->parseFromQuery($query, $usersDef);
    expect($usersState->page)->toBe(2);
    expect($usersState->size)->toBe(25);
    expect($usersState->sort)->toHaveCount(1);
    expect($usersState->filters)->toBeEmpty();

    $ordersState = $parser->parseFromQuery($query, $ordersDef);
    expect($ordersState->page)->toBe(5);
    expect($ordersState->size)->toBe(50);
    expect($ordersState->filters)->toHaveCount(1);
    expect($ordersState->sort)->toBeEmpty();
});
