<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|max:200',
            'phone'      => 'nullable|string|max:30',
            'program'    => 'nullable|string|max:100',
            'message'    => 'nullable|string|max:2000',
        ]);

        // In a real app, send an email or save to DB here.
        // For now, return a success response.
        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your message has been received. We\'ll get back to you within 24 hours.',
        ]);
    }
}
