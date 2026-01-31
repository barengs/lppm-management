<?php

namespace App\Http\Controllers;

use App\Models\OrganizationMember;
use Illuminate\Http\Request;

class OrganizationMemberController extends Controller
{
    public function index()
    {
        $members = OrganizationMember::with('user')
            ->orderBy('order_index')
            ->get();
            
        return response()->json($members);
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
