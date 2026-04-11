<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProposalPersonnel;

class MemberConsentController extends Controller
{
    /**
     * Get list of proposals where current user is a member and needs to give consent.
     */
    public function index()
    {
        $user = auth('api')->user();

        $memberships = ProposalPersonnel::with(['proposal.scheme', 'proposal.user'])
            ->where('user_id', $user->id)
            ->where('is_confirmed', false)
            ->get();

        return response()->json($memberships);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = auth('api')->user();

        $membership = ProposalPersonnel::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $membership->update([
            'is_confirmed' => true
        ]);

        return response()->json([
            'message' => 'Persetujuan berhasil diberikan.',
            'membership' => $membership
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
