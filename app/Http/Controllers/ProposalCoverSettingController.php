<?php

namespace App\Http\Controllers;

use App\Models\ProposalCoverSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProposalCoverSettingController extends Controller
{
    /**
     * Get settings for both types
     */
    public function index()
    {
        $penelitian = ProposalCoverSetting::where('type', 'penelitian')->first();
        $pkm = ProposalCoverSetting::where('type', 'pkm')->first();

        // Defaults if none exist
        if (!$penelitian) {
            $penelitian = ProposalCoverSetting::create([
                'type' => 'penelitian',
                'title_top' => 'USULAN PENELITIAN',
                'title_bottom_university' => 'UNIVERSITAS ISLAM MADURA'
            ]);
        }

        if (!$pkm) {
            $pkm = ProposalCoverSetting::create([
                'type' => 'pkm',
                'title_top' => 'USULAN PROGRAM KREATIVITAS MAHASISWA',
                'title_bottom_university' => 'UNIVERSITAS ISLAM MADURA'
            ]);
        }

        return response()->json([
            'penelitian' => $penelitian,
            'pkm' => $pkm
        ]);
    }

    /**
     * Update settings for a specific type
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:penelitian,pkm',
            'title_top' => 'nullable|string|max:255',
            'title_bottom_prodi' => 'nullable|string|max:255',
            'title_bottom_faculty' => 'nullable|string|max:255',
            'title_bottom_university' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $setting = ProposalCoverSetting::where('type', $validated['type'])->firstOrFail();

        // Handle File Upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($setting->logo_path) {
                Storage::disk('public')->delete($setting->logo_path);
            }
            $path = $request->file('logo')->store('covers', 'public');
            $validated['logo_path'] = $path;
        }

        unset($validated['logo']); // Don't try to save the file object to DB

        $setting->update($validated);

        return response()->json($setting);
    }
}
