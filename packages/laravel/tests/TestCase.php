<?php

namespace Tests;

use Orchestra\Testbench\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function getPackageProviders($app): array
    {
        return [
            \TabulatorManager\Laravel\TabulatorManagerServiceProvider::class,
            \Inertia\ServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('database.default', 'testbench');
        $app['config']->set('database.connections.testbench', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);

        $app['config']->set('database.connections.pgsql_test', [
            'driver' => 'pgsql',
            'host' => '127.0.0.1',
            'port' => 54329,
            'database' => 'tabulator_test',
            'username' => 'postgres',
            'password' => 'postgres',
            'charset' => 'utf8',
            'prefix' => '',
            'schema' => 'public',
            'sslmode' => 'prefer',
        ]);

        $app['config']->set('database.connections.mysql_test', [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'port' => 33306,
            'database' => 'tabulator_test',
            'username' => 'root',
            'password' => 'secret',
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
        ]);
    }
}
