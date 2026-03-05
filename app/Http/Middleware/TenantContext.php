<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantContext
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->tenant_id) {
            return response()->json(['error' => 'Unauthorized: No tenant context found.'], 403);
        }

        // Scope all queries globally to this tenant
        \App\Models\Tenant::setGlobalTenantId($user->tenant_id);

        return $next($request);
    }
}
