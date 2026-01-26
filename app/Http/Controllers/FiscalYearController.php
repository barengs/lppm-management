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
    
    /**
     * Display a listing of active fiscal years.
     */
    public function active()
    {
        return response()->json(FiscalYear::where('is_active', true)->get());
    }
}
