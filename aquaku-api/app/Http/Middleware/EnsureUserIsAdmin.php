<?php

namespace App\Http\Middleware;

use App\Services\SupabaseAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function __construct(private readonly SupabaseAuthService $auth)
    {
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // This validates both that the user is authenticated, and that they have admin privileges.
        // It aborts with 403 if they don't have admin privileges.
        $account = $this->auth->requireAdmin($request);

        $request->attributes->set('account', $account);

        return $next($request);
    }
}
