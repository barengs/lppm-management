<?php

namespace App\Http\Controllers;

use App\Models\RegistrationPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RegistrationPeriodController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kkn_period_id' => 'required|exists:kkn_periods,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $period = RegistrationPeriod::create($request->all());

        return response()->json([
            'message' => 'Registration Wave created successfully',
            'data' => $period
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $period = RegistrationPeriod::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $period->update($request->all());

        return response()->json([
            'message' => 'Registration Wave updated successfully',
            'data' => $period
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $period = RegistrationPeriod::findOrFail($id);
        $period->delete();

        return response()->json(['message' => 'Registration Wave deleted successfully']);
    }
}
