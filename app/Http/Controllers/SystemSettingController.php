<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SystemSetting;

class SystemSettingController extends Controller
{
    /**
     * Get system settings (Public/Protected mixed)
     */
    public function index()
    {
        // Singleton pattern: always ID 1
        $setting = SystemSetting::first();

        if (!$setting) {
            // Default empty if not seeded
            $setting = SystemSetting::create(['system_name' => 'System Name']);
        }

        return response()->json($setting);
    }

    /**
     * Update system settings (Admin only)
     */
    public function update(Request $request)
    {
        $setting = SystemSetting::firstOrFail();

        $validated = $request->validate([
            'system_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'logo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'favicon' => 'nullable|file|mimes:ico,jpg,png,webp|max:1024',
            'theme_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('system', 'public');
            $validated['logo_path'] = $path;
        }

        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('system', 'public');
            $validated['favicon_path'] = $path;
        }

        $setting->update($validated);

        return response()->json($setting);
    }
}
