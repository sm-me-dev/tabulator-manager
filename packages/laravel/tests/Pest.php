<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "uses()" function to bind a different classes or traits.
|
*/

uses(\Tests\TestCase::class);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
|
| Shared test helpers available to all test files.
|
*/

function createUsersTable(): void
{
    \Illuminate\Support\Facades\DB::statement("CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255),
        email VARCHAR(255),
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
}

function seedUsers(array $users): void
{
    foreach ($users as $user) {
        \Illuminate\Support\Facades\DB::table('users')->insert($user);
    }
}

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
*/

function something()
{
    // ..
}
