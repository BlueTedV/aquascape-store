<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n" . str_repeat('=', 65) . "\n";
echo "   AQUAKU PERFORMANCE & CACHE BENCHMARK TEST\n";
echo str_repeat('=', 65) . "\n\n";

$tests = [
    'Catalog Metadata'  => fn () => app(App\Services\SupabaseCatalogService::class)->catalogMetadata(),
    'Featured Products' => fn () => app(App\Services\SupabaseCatalogService::class)->featured(),
    'Hero Slides'       => fn () => app(App\Services\SupabaseHeroSlideService::class)->getSlides(),
    'Articles'          => fn () => app(App\Services\SupabaseArticleService::class)->getArticles(),
    'Admin Analytics'   => fn () => app(App\Services\SupabaseOrderService::class)->getAdminAnalytics(),
];

foreach ($tests as $name => $fn) {
    // Call 1
    $t0 = microtime(true);
    $fn();
    $t1 = microtime(true);

    // Call 2 (cached)
    $fn();
    $t2 = microtime(true);

    $dur1 = ($t1 - $t0) * 1000;
    $dur2 = ($t2 - $t1) * 1000;
    $speedup = $dur2 > 0 ? round($dur1 / $dur2, 1) : 0;

    echo sprintf("%-20s : 1st Call = %8.2f ms | 2nd Call = %6.2f ms (%sx faster)\n", $name, $dur1, $dur2, $speedup);
}

echo "\n" . str_repeat('=', 65) . "\n\n";
