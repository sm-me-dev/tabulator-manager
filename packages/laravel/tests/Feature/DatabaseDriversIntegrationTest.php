<?php

use Illuminate\Database\Connection;
use Illuminate\Database\MySqlConnection;
use Illuminate\Database\PostgresConnection;
use Illuminate\Support\Facades\DB;
use TabulatorManager\Laravel\TableDefinition;
use TabulatorManager\Laravel\TableQueryPipeline;
use TabulatorManager\Laravel\TableStateDTO;

uses(\Tests\TestCase::class);

/**
 * Real-database coverage for PostgreSQL/MySQL.
 *
 * In CI (`TM_REQUIRE_DB=1`) an unreachable server is a hard failure so the
 * matrix can never silently pass on the grammar-only fallback. Locally, when a
 * server is not running, we fall back to verifying SQL grammar compilation.
 */
function tmConnectionReachable(string $name): bool
{
    try {
        DB::connection($name)->getPdo();

        return true;
    } catch (\Throwable $e) {
        if (getenv('TM_REQUIRE_DB') === '1') {
            throw $e;
        }

        return false;
    }
}

function tmItemsDefinition(callable $query): TableDefinition
{
    return new TableDefinition(
        $query,
        [
            'title' => ['column' => 'title', 'sortable' => true, 'operators' => ['contains', '=']],
            'score' => ['column' => 'score', 'sortable' => true, 'operators' => ['>=', '<=']],
        ],
        'id'
    );
}

function tmScoreState(string $dir): TableStateDTO
{
    return new TableStateDTO(
        page: 1,
        size: 10,
        sort: [['field' => 'score', 'dir' => $dir]],
        filters: [['field' => 'score', 'operator' => '>=', 'value' => '50']]
    );
}

function tmCompileFallbackSql(Connection $connection, string $table, string $dir): string
{
    $builder = $connection->table($table);
    $builder->where('title', 'like', '%PG%');
    $builder->where('score', '>=', '50');
    $builder->orderBy('score', $dir);

    return $builder->toSql();
}

it('runs query pipeline successfully on SQLite driver', function () {
    DB::connection('testbench')->statement('CREATE TABLE items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255),
        score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )');

    DB::connection('testbench')->table('items')->insert([
        ['title' => 'Alpha item', 'score' => 50],
        ['title' => 'Beta item', 'score' => 90],
        ['title' => 'Gamma item', 'score' => 30],
    ]);

    $definition = tmItemsDefinition(fn () => DB::connection('testbench')->table('items'));
    $result = (new TableQueryPipeline())->run($definition, tmScoreState('desc'));

    expect($result['meta']['total'])->toBe(2);
    expect($result['data'][0]->title)->toBe('Beta item');
    expect($result['data'][1]->title)->toBe('Alpha item');
});

it('runs query pipeline successfully on PostgreSQL driver', function () {
    if (! tmConnectionReachable('pgsql_test')) {
        $connection = new PostgresConnection(new \Tests\Fakes\FakePdo(), 'tabulator_test', '', ['prefix' => '']);
        $sql = tmCompileFallbackSql($connection, 'pg_items', 'asc');

        expect($sql)->toMatch('/where "title"(::text)? like \?/');
        expect($sql)->toContain('"score" >= ?');
        expect($sql)->toContain('order by "score" asc');

        return;
    }

    $db = DB::connection('pgsql_test');
    $db->statement('DROP TABLE IF EXISTS pg_items CASCADE;');
    $db->statement('CREATE TABLE pg_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );');

    try {
        $db->table('pg_items')->insert([
            ['title' => 'PG Alpha', 'score' => 10],
            ['title' => 'PG Beta', 'score' => 95],
            ['title' => 'PG Gamma', 'score' => 80],
        ]);

        $result = (new TableQueryPipeline())->run(tmItemsDefinition(fn () => $db->table('pg_items')), tmScoreState('asc'));

        expect($result['meta']['total'])->toBe(2);
        expect($result['data'][0]->title)->toBe('PG Gamma');
        expect($result['data'][1]->title)->toBe('PG Beta');
    } finally {
        $db->statement('DROP TABLE IF EXISTS pg_items CASCADE;');
    }
});

it('runs query pipeline successfully on MySQL driver', function () {
    if (! extension_loaded('pdo_mysql') || ! tmConnectionReachable('mysql_test')) {
        if (getenv('TM_REQUIRE_DB') === '1') {
            throw new \RuntimeException('TM_REQUIRE_DB=1 but pdo_mysql / MySQL server is unavailable.');
        }

        $connection = new MySqlConnection(new \Tests\Fakes\FakePdo(), 'tabulator_test', '', ['prefix' => '']);
        $sql = tmCompileFallbackSql($connection, 'mysql_items', 'desc');

        expect($sql)->toContain('where `title` like ?');
        expect($sql)->toContain('`score` >= ?');
        expect($sql)->toContain('order by `score` desc');

        return;
    }

    $db = DB::connection('mysql_test');
    $db->statement('DROP TABLE IF EXISTS mysql_items;');
    $db->statement('CREATE TABLE mysql_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );');

    try {
        $db->table('mysql_items')->insert([
            ['title' => 'MySQL Alpha', 'score' => 15],
            ['title' => 'MySQL Beta', 'score' => 75],
            ['title' => 'MySQL Gamma', 'score' => 99],
        ]);

        $result = (new TableQueryPipeline())->run(tmItemsDefinition(fn () => $db->table('mysql_items')), tmScoreState('desc'));

        expect($result['meta']['total'])->toBe(2);
        expect($result['data'][0]->title)->toBe('MySQL Gamma');
        expect($result['data'][1]->title)->toBe('MySQL Beta');
    } finally {
        $db->statement('DROP TABLE IF EXISTS mysql_items;');
    }
});
