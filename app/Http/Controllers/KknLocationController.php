<?php

namespace App\Http\Controllers;

use App\Models\KknLocation;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\LocationsImport;
use App\Exports\LocationsTemplateExport;

class KknLocationController extends Controller
{
    public function index()
    {
        return response()->json(KknLocation::with(['fiscalYear', 'province', 'city', 'district', 'village'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'name' => 'required|string',
            'quota' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'location_type' => 'required|in:domestic,international',
            'country' => 'required_if:location_type,international|nullable|string',
            'province_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_provinces,id',
            'city_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_cities,id',
            'district_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_districts,id',
            'village_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_villages,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);


        $location = KknLocation::create($validated);
        return response()->json($location, 201);
    }

    public function update(Request $request, KknLocation $kknLocation)
    {
        $validated = $request->validate([
            'fiscal_year_id' => 'exists:fiscal_years,id',
            'name' => 'string',
            'quota' => 'integer|min:1',
            'description' => 'nullable|string',
            'location_type' => 'in:domestic,international',
            'country' => 'required_if:location_type,international|nullable|string',
            'province_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_provinces,id',
            'city_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_cities,id',
            'district_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_districts,id',
            'village_id' => 'required_if:location_type,domestic|nullable|exists:indonesia_villages,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $kknLocation->update($validated);
        return response()->json($kknLocation);
    }

    public function destroy(KknLocation $kknLocation)
    {
        $kknLocation->delete();
        return response()->noContent();
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
        ]);

        Excel::import(new LocationsImport($request->fiscal_year_id), $request->file('file'));
        
        return response()->json(['message' => 'Import successful']);
    }

    public function downloadTemplate()
    {
        return Excel::download(new LocationsTemplateExport, 'locations_template.xlsx');
    }
}
