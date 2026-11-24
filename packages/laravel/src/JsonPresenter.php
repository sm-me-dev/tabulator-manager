<?php

namespace TabulatorManager\Laravel;

use Illuminate\Http\JsonResponse;

/**
 * Presents a pipeline result as a JSON HTTP response.
 *
 * Response shape: { data: [...], meta: { current_page, per_page, total, last_page } }
 */
final class JsonPresenter
{
    public function present(array $result): JsonResponse
    {
        return response()->json([
            "data" => $result["data"],
            "meta" => $result["meta"],
        ]);
    }
}
