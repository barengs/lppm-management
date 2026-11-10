<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (
            (str_contains((string) config('app.url'), 'https://') && !app()->environment('local'))
            || (!app()->runningInConsole() && request()->header('X-Forwarded-Proto') === 'https')
        ) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Implicitly grant "admin" role all permissions
        // This works in the app by using gate-related functions like auth()->user->can() and @can()
        \Illuminate\Support\Facades\Gate::before(function ($user, $ability) {
            return $user->hasRole('admin') ? true : null;
        });
    }
}
