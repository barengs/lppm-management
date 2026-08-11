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

        // Limit access: Admin/Staff can see all.
        $user = Auth::user();
        $isGlobalViewer = $user->hasRole('admin') || $user->can('kkn_postos.manage_members') || $user->can('reports.view');
        
        if (!$isGlobalViewer) {
            $query->where(function($q) use ($user) {
                if ($user->hasRole('dosen')) {
                    $q->whereHas('posto', function($q2) use ($user) {
                        $q2->where('dpl_id', $user->id);
                    });
                }
                if ($user->can('kkn_field_monitorings.view')) {
                    $q->orWhereHas('posto.fieldMonitors', function($q2) use ($user) {
                        $q2->where('users.id', $user->id);
                    });
                }
            });
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
