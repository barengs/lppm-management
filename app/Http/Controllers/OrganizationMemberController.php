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
            'user_id' => 'required|exists:users,id',
            'position' => 'required|string',
            'image' => 'nullable|string',
            'order_index' => 'integer',
            'parent_id' => 'nullable|exists:organization_members,id',
            'level' => 'required|integer|min:1'
        ]);

        $member = OrganizationMember::create($validated);
        return response()->json($member, 201);
    }
    public function update(Request $request, OrganizationMember $organizationMember)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'position' => 'required|string',
            'image' => 'nullable|string',
            'order_index' => 'integer',
            'parent_id' => 'nullable|exists:organization_members,id',
            'level' => 'required|integer|min:1'
        ]);

        $organizationMember->update($validated);
        return response()->json($organizationMember);
    }

    public function destroy(OrganizationMember $organizationMember)
    {
        $organizationMember->delete();
        return response()->json(['message' => 'Member deleted successfully']);
    }
}
