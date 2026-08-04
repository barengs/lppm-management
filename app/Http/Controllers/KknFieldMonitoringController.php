<?php

namespace App\Http\Controllers;

use App\Models\KknFieldMonitoring;
use App\Models\KknFieldMonitoringImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class KknFieldMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $query = KknFieldMonitoring::with(['user', 'images', 'posto']);

        if ($request->has('kkn_posto_id')) {
            $query->where('kkn_posto_id', $request->kkn_posto_id);
        }

        // Limit access: Staff/Admin can see all, DPL can see for their postos
        $user = Auth::user();
        if (!$user->can('kkn_field_monitorings.view') && !$user->hasRole('admin')) {
            $postoIds = \App\Models\KknPosto::where('dpl_id', $user->id)->pluck('id');
            $query->whereIn('kkn_posto_id', $postoIds);
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'kkn_posto_id' => 'required|exists:kkn_postos,id',
            'description' => 'required|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'monitored_at' => 'required|date',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:5120', // 5MB per photo
        ]);

        $monitoring = KknFieldMonitoring::create([
            'kkn_posto_id' => $request->kkn_posto_id,
            'user_id' => Auth::id(),
            'description' => $request->description,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'monitored_at' => $request->monitored_at,
            'status' => 'submitted',
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('kkn-field-monitorings/' . $monitoring->id, 'public');
                KknFieldMonitoringImage::create([
                    'kkn_field_monitoring_id' => $monitoring->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                ]);
            }
        }

        return response()->json($monitoring->load('images'), 201);
    }

    public function show($id)
    {
        $monitoring = KknFieldMonitoring::with(['user', 'images', 'posto'])->findOrFail($id);
        return response()->json($monitoring);
    }

    public function destroy($id)
    {
        $monitoring = KknFieldMonitoring::findOrFail($id);
        
        // Only owner or admin can delete
        if ($monitoring->user_id !== Auth::id() && !Auth::user()->can('kkn_field_monitorings.delete') && !Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        foreach ($monitoring->images as $image) {
            Storage::disk('public')->delete($image->file_path);
        }

        $monitoring->delete();
        return response()->noContent();
    }
}
