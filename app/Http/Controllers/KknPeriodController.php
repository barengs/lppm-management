<?php

namespace App\Http\Controllers;

use App\Models\KknPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KknPeriodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = KknPeriod::with('registrationPeriods')->withCount(['registrationPeriods', 'kknRegistrations']);

        if ($request->has('active')) {
            $query->where('is_active', $request->active === 'true' || $request->active === '1');
        }

        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        $query->orderBy('year', 'desc');

        if ($request->has('no_pagination') && $request->no_pagination) {
            return response()->json($query->get());
        }

        $perPage = $request->input('per_page', 10);
        $periods = $query->paginate($perPage);

        return response()->json($periods);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'year' => 'required|integer|min:2020|max:2099',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $period = KknPeriod::create($request->all());

        return response()->json([
            'message' => 'KKN Period created successfully',
            'data' => $period
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $period = KknPeriod::with(['registrationPeriods' => function ($q) {
            $q->orderBy('start_date', 'asc');
        }])->findOrFail($id);

        return response()->json($period);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $period = KknPeriod::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'year' => 'sometimes|required|integer|min:2020|max:2099',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $period->update($request->all());

        return response()->json([
            'message' => 'KKN Period updated successfully',
            'data' => $period
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $period = KknPeriod::findOrFail($id);
        
        // Prevent deletion if it has dependent records
        if ($period->kknRegistrations()->exists() || $period->kknLocations()->exists()) {
            return response()->json([
                'message' => 'Cannot delete period with associated data (registrations or locations).'
            ], 409);
        }

        $period->delete();

        return response()->json(['message' => 'KKN Period deleted successfully']);
    }
}
