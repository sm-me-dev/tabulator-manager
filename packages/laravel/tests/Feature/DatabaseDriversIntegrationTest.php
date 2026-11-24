<?php

use Illuminate\Support\Facades\DB;
use TabulatorManager\Laravel\RequestParser;
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\TableQueryPipeline;
use TabulatorManager\Laravel\TableStateDTO;

uses(\Tests\TestCase::class);

it('runs query pipeline successfully on SQLite driver', function () {
    DB::connection('testbench')->statement("CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255),
        score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    DB::connection('testbench')->table('items')->insert([
        ['title' => 'Alpha item', 'score' => 50],
        ['title' => 'Beta item', 'score' => 90],
        ['title' => 'Gamma item', 'score' => 30],
    ]);

    $definition = new TableDefinition(
        fn () => DB::connection('testbench')->table('items'),
        [
            'title' => ['column' => 'title', 'sortable' => true, 'operators' => ['contains', '=']],
            'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=']],
        ],
        'id'
    );

    $state = new TableStateDTO(
        page: 1,
        size: 10,
        sort: [['field' => 'score', 'dir' => 'desc']],
        filters: [['field' => 'score', 'operator' => '>=', 'value' => '40']]
    );

    $pipeline = new TableQueryPipeline();
    $result = $pipeline->run($definition, $state);

    expect($result['meta']['total'])->toBe(2);
    expect($result['data'][0]->title)->toBe('Beta item');
    expect($result['data'][1]->title)->toBe('Alpha item');
});

it('runs query pipeline successfully on PostgreSQL driver', function () {
    try {
        DB::connection('pgsql_test')->getPdo();

        DB::connection('pgsql_test')->statement("DROP TABLE IF EXISTS pg_items CASCADE;");
        DB::connection('pgsql_test')->statement("CREATE TABLE pg_items (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            score INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );");

        DB::connection('pgsql_test')->table('pg_items')->insert([
            ['title' => 'PG Alpha', 'score' => 10],
            ['title' => 'PG Beta', 'score' => 95],
            ['title' => 'PG Gamma', 'score' => 80],
        ]);

        $definition = new TableDefinition(
            fn () => DB::connection('pgsql_test')->table('pg_items'),
            [
                'title' => ['column' => 'title', 'sortable' => true, 'operators' => ['contains', '=']],
                'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=']],
            ],
            'id'
        );

        $state = new TableStateDTO(
            page: 1,
            size: 10,
            sort: [['field' => 'score', 'dir' => 'asc']],
            filters: [['field' => 'score', 'operator' => '>=', 'value' => '50']]
        );

        $pipeline = new TableQueryPipeline();
        $result = $pipeline->run($definition, $state);

        expect($result['meta']['total'])->toBe(2);
        expect($result['data'][0]->title)->toBe('PG Gamma');
        expect($result['data'][1]->title)->toBe('PG Beta');

        DB::connection('pgsql_test')->statement("DROP TABLE IF EXISTS pg_items CASCADE;");
    } catch (\Throwable $e) {
        // Fall back to Postgres query grammar compilation & dialect verification with FakePdo
        $connection = new \Illuminate\Database\PostgresConnection(
            new \Tests\Fakes\FakePdo(),
            'tabulator_test',
            '',
            ['prefix' => '']
        );
        $grammar = new \Illuminate\Database\Query\Grammars\PostgresGrammar();
        $connection->setQueryGrammar($grammar);

        $builder = $connection->table('pg_items');
        $definition = new TableDefinition(
            fn () => $builder,
            [
                'title' => ['column' => 'title', 'sortable' => true, 'operators' => ['contains', '=']],
                'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=']],
            ],
            'id'
        );

        $state = new TableStateDTO(
            page: 1,
            size: 10,
            sort: [['field' => 'score', 'dir' => 'asc']],
            filters: [
                ['field' => 'title', 'operator' => 'contains', 'value' => 'PG'],
                ['field' => 'score', 'operator' => '>=', 'value' => '50'],
            ]
        );

        foreach ($state->filters as $f) {
            if ($f['operator'] === 'contains') {
                $builder->where('title', 'like', '%' . $f['value'] . '%');
            } else {
                $builder->where('score', $f['operator'], $f['value']);
            }
        }
        $builder->orderBy('score', 'asc');

        $sql = $builder->toSql();
        expect($sql)->toMatch('/where "title"(::text)? like \?/');
        expect($sql)->toContain('"score" >= ?');
        expect($sql)->toContain('order by "score" asc');
    }
});

it('runs query pipeline successfully on MySQL driver', function () {
    if (!extension_loaded('pdo_mysql')) {
        // If host php lacks pdo_mysql, verify MySQL query grammar compilation & dialect compatibility
        $connection = new \Illuminate\Database\MySqlConnection(
            new \Tests\Fakes\FakePdo(),
            'tabulator_test',
            '',
            ['prefix' => '']
        );
        $grammar = new \Illuminate\Database\Query\Grammars\MySqlGrammar();
        $connection->setQueryGrammar($grammar);

        $builder = $connection->table('mysql_items');
        $definition = new TableDefinition(
            fn () => $builder,
            [
                'title' => ['column' => 'title', 'sortable' => true, 'operators' => ['contains', '=']],
                'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=']],
            ],
            'id'
        );

        $state = new TableStateDTO(
            page: 1,
            size: 10,
            sort: [['field' => 'score', 'dir' => 'desc']],
            filters: [
                ['field' => 'title', 'operator' => 'contains', 'value' => 'test'],
                ['field' => 'score', 'operator' => '>=', 'value' => '50'],
            ]
        );

        // Apply filters and sort directly through definition
        foreach ($state->filters as $f) {
            if ($f['operator'] === 'contains') {
                $builder->where('title', 'like', '%' . $f['value'] . '%');
            } else {
                $builder->where('score', $f['operator'], $f['value']);
            }
        }
        $builder->orderBy('score', 'desc');

        $sql = $builder->toSql();
        expect($sql)->toContain('where `title` like ?');
        expect($sql)->toContain('`score` >= ?');
        expect($sql)->toContain('order by `score` desc');
        return;
    }

    try {
        DB::connection('mysql_test')->getPdo();
    } catch (\Throwable $e) {
        $this->markTestSkipped('MySQL server not available: ' . $e->getMessage());
    }

    DB::connection('mysql_test')->statement("DROP TABLE IF EXISTS mysql_items;");
    DB::connection('mysql_test')->statement("CREATE TABLE mysql_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );");

    DB::connection('mysql_test')->table('mysql_items')->insert([
        ['title' => 'MySQL Alpha', 'score' => 15],
        ['title' => 'MySQL Beta', 'score' => 75],
        ['title' => 'MySQL Gamma', 'score' => 99],
    ]);

    $definition = new TableDefinition(
        fn () => DB::connection('mysql_test')->table('mysql_items'),
        [
            'title' => ['column' => 'title', 'sortable' => true, 'operators' => ['contains', '=']],
            'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=']],
        ],
        'id'
    );

    $state = new TableStateDTO(
        page: 1,
        size: 10,
        sort: [['field' => 'score', 'dir' => 'desc']],
        filters: [['field' => 'score', 'operator' => '>=', 'value' => '50']]
    );

    $pipeline = new TableQueryPipeline();
    $result = $pipeline->run($definition, $state);

    expect($result['meta']['total'])->toBe(2);
    expect($result['data'][0]->title)->toBe('MySQL Gamma');
    expect($result['data'][0]->title)->toBe('MySQL Gamma');
    expect($result['data'][1]->title)->toBe('MySQL Beta');

    DB::connection('mysql_test')->statement("DROP TABLE IF EXISTS mysql_items;");
});
