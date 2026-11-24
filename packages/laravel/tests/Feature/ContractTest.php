<?php

use TabulatorManager\Laravel\RequestParser;
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\TableStateDTO;

uses(\Tests\TestCase::class);

it('verifies shared JSON fixtures match PHP TableStateParser identically', function () {
    $fixturesJson = file_get_contents(__DIR__ . '/../../../../fixtures/contracts/table-state-contract.json');
    $fixtures = json_decode($fixturesJson, true);

    $usersDefinition = new TableDefinition(
        fn () => null,
        [
            'title' => ['column' => 'title', 'sortable' => true, 'operators' => ['contains', '=']],
            'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=', '=', '!=']],
            'created_at' => ['column' => 'created_at', 'sortable' => true, 'operators' => ['asc', 'desc', '=']],
        ],
        'id',
        defaultPageSize: 20,
        maxPageSize: 100,
        tableId: 'users'
    );

    $ordersDefinition = new TableDefinition(
        fn () => null,
        [
            'order_date' => ['column' => 'order_date', 'sortable' => true, 'operators' => ['=']],
            'total' => ['column' => 'total', 'sortable' => true, 'operators' => ['>=', '<=', '=']],
        ],
        'id',
        defaultPageSize: 20,
        maxPageSize: 100,
        tableId: 'orders'
    );

    $parser = new RequestParser();

    foreach ($fixtures as $fixture) {
        $parsedQuery = [];
        if (!empty($fixture['queryString'])) {
            // Strip hash fragment if present (PHP requests don't receive hash)
            $queryStringOnly = explode('#', $fixture['queryString'])[0];
            parse_str($queryStringOnly, $parsedQuery);
        }

        $definition = $fixture['tableId'] === 'orders' ? $ordersDefinition : $usersDefinition;
        $state = $parser->parseFromQuery($parsedQuery, $definition, $fixture['tableId']);

        $expected = $fixture['expectedState'];

        expect($state->page)->toBe($expected['page'], "Failed page on {$fixture['name']}");
        expect($state->size)->toBe($expected['size'], "Failed size on {$fixture['name']}");
        expect($state->sort)->toBe($expected['sort'], "Failed sort on {$fixture['name']}");
        expect($state->filters)->toBe($expected['filters'], "Failed filters on {$fixture['name']}");
    }
});
