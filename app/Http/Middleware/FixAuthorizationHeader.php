<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * On cPanel with PHP-FPM, Apache does not populate $_SERVER['HTTP_AUTHORIZATION'].
 * getallheaders() still returns it, so we copy it onto the request before
 * Sanctum's token guard runs.
 */
class FixAuthorizationHeader
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->hasHeader('Authorization') && function_exists('getallheaders')) {
            $headers = getallheaders();
            $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? null;
            if ($auth) {
                $request->headers->set('Authorization', $auth);
            }
        }

        return $next($request);
    }
}
