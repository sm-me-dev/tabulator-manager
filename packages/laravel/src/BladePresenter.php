<?php

namespace TabulatorManager\Laravel;

/**
 * Presents a pipeline result for Blade views.
 *
 * Returns the raw result array so the controller can pass it directly to
 * `view('table.index', ['table' => $result])`. Blade templates can then
 * hydrate server-supplied columns and rows without a redundant initial
 * client-side request.
 */
final class BladePresenter
{
    public function present(array $result): array
    {
        return $result;
    }
}
