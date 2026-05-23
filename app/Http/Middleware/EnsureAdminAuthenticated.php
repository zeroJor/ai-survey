<?php

namespace App\Http\Middleware;

use App\Support\AdminEmail;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! AdminEmail::isAllowed((string) $user->email)) {
            return response()->json([
                'message' => 'Admin authentication required.',
            ], 401);
        }

        return $next($request);
    }
}
