<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /** Public — returns only theme colours (no auth required). */
    public function theme(): JsonResponse
    {
        $s = CompanySetting::instance();
        return response()->json([
            'theme_primary' => $s->theme_primary ?? '#fe730c',
            'theme_navy'    => $s->theme_navy    ?? '#081f4e',
        ]);
    }

    public function show(): JsonResponse
    {
        $settings = CompanySetting::instance();

        if ($settings->company_logo) {
            $settings->company_logo_url = asset('storage/' . $settings->company_logo);
        } else {
            $settings->company_logo_url = null;
        }

        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name'    => 'nullable|string|max:200',
            'company_address' => 'nullable|string|max:1000',
            'company_vision'  => 'nullable|string|max:2000',
            'company_mission' => 'nullable|string|max:2000',
            'company_phone'   => 'nullable|string|max:30',
            'company_email'   => 'nullable|email|max:150',
            'company_kra_pin' => 'nullable|string|max:50',
            'company_logo'    => 'nullable|file|mimes:jpg,jpeg,png,gif,svg,webp|max:2048',
            'facebook_link'   => 'nullable|url|max:500',
            'instagram_link'  => 'nullable|url|max:500',
            'youtube_link'    => 'nullable|url|max:500',
            'linkedin_link'   => 'nullable|url|max:500',
            'twitter_link'    => 'nullable|url|max:500',
            'theme_primary'   => 'nullable|string|max:20',
            'theme_navy'      => 'nullable|string|max:20',
        ]);

        $settings = CompanySetting::instance();

        // Handle logo upload
        if ($request->hasFile('company_logo')) {
            // Delete old logo if exists
            if ($settings->company_logo) {
                Storage::disk('public')->delete($settings->company_logo);
            }
            $path = $request->file('company_logo')->store('logos', 'public');
            $data['company_logo'] = $path;
        } else {
            unset($data['company_logo']);
        }

        $settings->update($data);

        $settings->company_logo_url = $settings->company_logo
            ? asset('storage/' . $settings->company_logo)
            : null;

        return response()->json([
            'success'  => true,
            'message'  => 'Settings saved successfully.',
            'settings' => $settings,
        ]);
    }

    public function removeLogo(): JsonResponse
    {
        $settings = CompanySetting::instance();

        if ($settings->company_logo) {
            Storage::disk('public')->delete($settings->company_logo);
            $settings->update(['company_logo' => null]);
        }

        return response()->json(['success' => true, 'message' => 'Logo removed.']);
    }
}
