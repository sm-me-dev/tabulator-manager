<?php

namespace TabulatorManager\Laravel;

use Illuminate\Support\ServiceProvider;

final class TabulatorManagerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . "/../config/tabulator-manager.php",
            "tabulator-manager"
        );
    }

    public function boot(): void
    {
        $this->publishes(
            [
                __DIR__ . "/../config/tabulator-manager.php" =>
                    config_path("tabulator-manager.php"),
            ],
            "tabulator-manager-config"
        );

        if (class_exists(\Inertia\Response::class) && method_exists(\Inertia\Response::class, 'macro')) {
            \Inertia\Response::macro('data', function (?string $key = null) {
                return $key !== null ? ($this->props[$key] ?? null) : $this->props;
            });
        }
    }
}
