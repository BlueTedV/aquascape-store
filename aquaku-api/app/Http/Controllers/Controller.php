<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Base Controller for Aquaku API endpoints.
 *
 * Provides the `respond()` helper which wraps controller actions in a centralized
 * exception boundary. It translates Laravel validation errors, HTTP exceptions, and
 * downstream HTTP client exceptions (such as Supabase REST or Midtrans API calls)
 * into a consistent JSON response format expected by the frontend.
 */
abstract class Controller
{
    /**
     * Safely execute a controller action and return a standardized JSON response with production-grade error handling.
     *
     * @param callable $callback
     * @param int $status
     * @param string|null $fallbackMessage
     * @return JsonResponse
     */
    protected function respond(callable $callback, int $status = 200, ?string $fallbackMessage = null): JsonResponse
    {
        try {
            return response()->json(['data' => $callback()], $status);
        } catch (HttpResponseException $e) {
            throw $e;
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'The given data was invalid.',
                'errors' => $e->errors(),
            ], 422);
        } catch (HttpExceptionInterface $e) {
            $statusCode = $e->getStatusCode();

            return response()->json([
                'message' => $e->getMessage() ?: 'Request failed.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
        } catch (RequestException $e) {
            report($e);

            $statusCode = $e->response ? $e->response->status() : 500;

            if (config('app.debug')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'debug' => [
                        'status' => $statusCode,
                        'body' => $e->response ? $e->response->json() : null,
                    ],
                ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
            }

            $clientMessage = null;
            if ($e->response && $statusCode >= 400 && $statusCode < 500) {
                $body = $e->response->json();
                $clientMessage = $body['msg'] ?? $body['message'] ?? $body['error_description'] ?? null;
            }

            return response()->json([
                'message' => $clientMessage ?: ($fallbackMessage ?: 'Service request failed. Please try again later.'),
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
        } catch (Throwable $error) {
            report($error);

            $statusCode = method_exists($error, 'getStatusCode') ? $error->getStatusCode() : 500;

            if (config('app.debug')) {
                return response()->json([
                    'message' => $error->getMessage() ?: 'An unexpected error occurred.',
                    'exception' => get_class($error),
                    'file' => $error->getFile(),
                    'line' => $error->getLine(),
                ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
            }

            return response()->json([
                'message' => $fallbackMessage ?: 'An unexpected error occurred. Please try again later.',
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 500);
        }
    }
}
