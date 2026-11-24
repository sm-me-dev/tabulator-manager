<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Inertia\Response as InertiaResponse;
use TabulatorManager\Laravel\BladePresenter;
use TabulatorManager\Laravel\InertiaPresenter;
use TabulatorManager\Laravel\JsonPresenter;
use TabulatorManager\Laravel\RequestParser;
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\TableQueryPipeline;

uses(\Tests\TestCase::class);

it('JsonPresenter returns a JSON response with data and meta', function () {
    createUsersTable();
    DB::table('users')->insert(['name' => 'Alice', 'active' => 1]);

    $definition = new TableDefinition(
        fn () => DB::table('users')->where('active', 1),
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();
    $presenter = new JsonPresenter();

    $state = $parser->parseFromQuery(['tm' => ['page' => 1, 'size' => 10]], $definition);
    $result = $pipeline->run($definition, $state);
    $response = $presenter->present($result);

    expect($response)->toBeInstanceOf(JsonResponse::class);
    $content = json_decode($response->getContent(), true);
    expect($content)->toHaveKey('data');
    expect($content)->toHaveKey('meta');
    expect($content['meta'])->toHaveKeys(['current_page', 'per_page', 'total', 'last_page']);
});

it('BladePresenter returns raw result array', function () {
    createUsersTable();
    DB::table('users')->insert(['name' => 'Alice', 'active' => 1]);

    $definition = new TableDefinition(
        fn () => DB::table('users')->where('active', 1),
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();
    $presenter = new BladePresenter();

    $state = $parser->parseFromQuery(['tm' => ['page' => 1, 'size' => 10]], $definition);
    $result = $pipeline->run($definition, $state);
    $presented = $presenter->present($result);

    expect($presented)->toBe($result);
    expect($presented)->toHaveKeys(['data', 'meta']);
});

it('InertiaPresenter returns Inertia response with table prop', function () {
    createUsersTable();
    DB::table('users')->insert(['name' => 'Alice', 'active' => 1]);

    $definition = new TableDefinition(
        fn () => DB::table('users')->where('active', 1),
        ['name' => ['column' => 'name', 'sortable' => true, 'operators' => ['=']]],
        'id'
    );

    $parser = new RequestParser();
    $pipeline = new TableQueryPipeline();
    $presenter = new InertiaPresenter();

    $state = $parser->parseFromQuery(['tm' => ['page' => 1, 'size' => 10]], $definition);
    $result = $pipeline->run($definition, $state);
    $inertiaResponse = $presenter->present('tables/index', $result);

    expect($inertiaResponse)->toBeInstanceOf(InertiaResponse::class);
    expect($inertiaResponse->data('table'))->toHaveKeys(['data', 'meta']);
});
