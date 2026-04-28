<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Forces all API requests to return JSON even when the client
 * does not send Accept: application/json — prevents Laravel from
 * returning an HTML error page that the frontend can't parse.
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
