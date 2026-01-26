<?php

namespace App\Http\Controllers;

use App\Models\OrganizationMember;
use Illuminate\Http\Request;

class OrganizationMemberController extends Controller
{
    public function index()
    {
        return response()->json(OrganizationMember::orderBy('order_index')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'position' => 'required|string',
            'image' => 'nullable|string',
            'order_index' => 'integer'
        ]);

        $member = OrganizationMember::create($validated);
        return response()->json($member, 201);
    }
}
