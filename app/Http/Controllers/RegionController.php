<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Village;

class RegionController extends Controller
{
    public function provinces()
    {
        return response()->json(Province::orderBy('name')->get());
    }

    public function cities(Request $request)
    {
        $provinceId = $request->query('province_id');
        if ($provinceId) {
            $province = Province::find($provinceId);
            if ($province) {
                return response()->json(City::where('province_code', $province->code)->orderBy('name')->get());
            }
        }
        return response()->json([]);
    }

    public function districts(Request $request)
    {
        $cityId = $request->query('city_id');
        if ($cityId) {
            $city = City::find($cityId);
            if ($city) {
                return response()->json(District::where('city_code', $city->code)->orderBy('name')->get());
            }
        }
        return response()->json([]);
    }

    public function villages(Request $request)
    {
        $districtId = $request->query('district_id');
        if ($districtId) {
            $district = District::find($districtId);
            if ($district) {
                return \Laravolt\Indonesia\Models\Village::where('district_code', $district->code)->orderBy('name')->get();
            }
        }
        return response()->json([]);
    }
}
