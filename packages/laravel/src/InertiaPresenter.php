<?php

namespace TabulatorManager\Laravel;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Presents a pipeline result for Inertia.js responses.
 *
 * Shares the result as a `table` prop so the client can hydrate columns
 * and rows without a redundant initial request.
 */
final class InertiaPresenter
{
    public function present(string $component, array $result, array $additional = []): Response
    {
        $payload = [
            'data' => $result['data'],
            'meta' => $result['meta'],
        ];

        return Inertia::render($component, array_merge([
            'table' => $payload,
        ], $additional));
    }
}
