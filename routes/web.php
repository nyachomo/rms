<?php

use Illuminate\Support\Facades\Route;

// Catch-all route: serve the React SPA for all non-API requests
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
