<?php

namespace App\Http\Middleware;

use App\Services\SupabaseAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAuthenticated
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
        // This will abort with a 401 if the token is missing, invalid, or expired.
        // And it will attach the account details to the request for controllers to use if needed.
        $account = $this->auth->accountFromRequest($request);

        $request->attributes->set('account', $account);

        return $next($request);
    }
}
