<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use TabulatorManager\Laravel\JsonPresenter;
use TabulatorManager\Laravel\RequestParser;
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\TableQueryPipeline;

// Fast health-check probe for Render cold start detection
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'tabulator-manager-api',
        'timestamp' => now()->toIso8601String(),
        'database' => 'sqlite',
    ]);
});

// Users table endpoint
Route::get('/users', function (Request $request) {
    $definition = new TableDefinition(
        fn () => DB::table('users'),
        [
            'id' => ['column' => 'id', 'sortable' => true],
            'name' => ['column' => 'name', 'sortable' => true, 'operators' => ['contains', '=']],
            'email' => ['column' => 'email', 'sortable' => true, 'operators' => ['contains', '=']],
            'role' => ['column' => 'role', 'sortable' => true, 'operators' => ['=']],
            'status' => ['column' => 'status', 'sortable' => true, 'operators' => ['=']],
            'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=', '=', '!=']],
            'jalali_date' => ['column' => 'jalali_date', 'sortable' => true, 'operators' => ['=']],
            'created_at' => ['column' => 'created_at', 'sortable' => true, 'operators' => ['=']],
        ],
        stableOrderColumn: 'id',
        defaultPageSize: 20,
        maxPageSize: 100,
        tableId: 'users'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromRequest($request, $definition, 'users');

    $pipeline = new TableQueryPipeline();
    $result = $pipeline->run($definition, $state);

    $presenter = new JsonPresenter();
    return $presenter->present($result);
});

// Orders table endpoint
Route::get('/orders', function (Request $request) {
    $definition = new TableDefinition(
        fn () => DB::table('orders'),
        [
            'id' => ['column' => 'id', 'sortable' => true],
            'order_number' => ['column' => 'order_number', 'sortable' => true, 'operators' => ['contains', '=']],
            'customer' => ['column' => 'customer', 'sortable' => true, 'operators' => ['contains', '=']],
            'amount' => ['column' => 'amount', 'sortable' => true, 'operators' => ['>=', '<=', '=']],
            'status' => ['column' => 'status', 'sortable' => true, 'operators' => ['=']],
            'order_date' => ['column' => 'order_date', 'sortable' => true, 'operators' => ['=']],
        ],
        stableOrderColumn: 'id',
        defaultPageSize: 20,
        maxPageSize: 100,
        tableId: 'orders'
    );

    $parser = new RequestParser();
    $state = $parser->parseFromRequest($request, $definition, 'orders');

    $pipeline = new TableQueryPipeline();
    $result = $pipeline->run($definition, $state);

    $presenter = new JsonPresenter();
    return $presenter->present($result);
});
