<?php

namespace App\Http\Controllers;

use App\Models\FiscalYear;
use Illuminate\Http\Request;

class FiscalYearController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(FiscalYear::orderBy('year', 'desc')->get());
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|unique:fiscal_years,year',
            'is_active' => 'boolean'
        ]);

        if (isset($validated['is_active']) && $validated['is_active']) {
            FiscalYear::where('is_active', true)->update(['is_active' => false]);
        }

        $fiscalYear = FiscalYear::create($validated);
        return response()->json($fiscalYear, 201);
    }

    public function update(Request $request, FiscalYear $fiscalYear)
    {
        $validated = $request->validate([
            'year' => 'integer|unique:fiscal_years,year,' . $fiscalYear->id,
            'is_active' => 'boolean'
        ]);

        if (isset($validated['is_active']) && $validated['is_active']) {
            FiscalYear::where('id', '!=', $fiscalYear->id)->update(['is_active' => false]);
        }

        $fiscalYear->update($validated);
        return response()->json($fiscalYear);
    }

    public function destroy(FiscalYear $fiscalYear)
    {
        $fiscalYear->delete();
        return response()->noContent();
    }
    
    /**
     * Display a listing of active fiscal years.
     */
    public function active()
    {
        return response()->json(FiscalYear::where('is_active', true)->get());
    }
}
