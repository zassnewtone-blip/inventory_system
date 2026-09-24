<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden: Administrator privileges required.'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'Access denied. Administrator privileges required.');
        }

        return $next($request);
    }
}

