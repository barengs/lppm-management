<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use App\Models\ProposalIdentity;
use App\Models\ProposalPersonnel;
use App\Models\ProposalOutput;
use App\Models\ProposalBudgetItem;
use App\Models\SystemSetting;
use App\Services\TktService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProposalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth('api')->user();

        $proposals = Proposal::with(['scheme', 'fiscalYear', 'user'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($proposals);
    }

    /**
     * Get TKT Questions
     */
    public function tktQuestions()
    {
        return response()->json(TktService::getQuestions());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'scheme_id' => 'required|exists:schemes,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'title' => 'required|string|max:255',
        ]);

        $scheme = \App\Models\Scheme::findOrFail($validated['scheme_id']);
        $universityCluster = SystemSetting::first()?->university_cluster ?? 'Binaan';

        // Check PT Eligibility
        if ($scheme->eligible_clusters) {
            if (!in_array($universityCluster, $scheme->eligible_clusters)) {
                return response()->json([
                    'message' => 'Universitas Anda (Klaster ' . $universityCluster . ') tidak eligible untuk skema ini.'
                ], 422);
            }
        }

        $validated['user_id'] = auth('api')->id();
        $validated['status'] = 'draft';
        $validated['current_step'] = 0; // Start at TKT

        $proposal = Proposal::create($validated);
        
        // Automatically add current user as Chairman (Ketua)
        ProposalPersonnel::create([
            'proposal_id' => $proposal->id,
            'user_id' => auth('api')->id(),
            'role' => 'ketua',
            'is_confirmed' => true,
        ]);

        return response()->json($proposal, 201);
    }

    /**
     * Handle Step-by-Step Save
     */
    public function saveStep(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        $step = $request->input('step');

        try {
            DB::beginTransaction();

            switch ($step) {
                case 0: // TKT
                    $validated = $request->validate([
                        'answers' => 'required|array', // { indicator_id: boolean }
                    ]);
                    
                    $tktResult = TktService::calculateLevel($validated['answers']);
                    
                    $proposal->update([
                        'tkt_level' => $tktResult['level'],
                        'tkt_score' => $tktResult['score'],
                    ]);
                    break;

                case 1: // Identity
                    $validated = $request->validate([
                        'duration_years' => 'required|integer|min:1|max:3',
                        'science_cluster_level_3' => 'required|string',
                        'focus_area' => 'required|string',
                        'research_theme' => 'required|string',
                        'research_topic' => 'required|string',
                        'tkt_initial' => 'required|integer',
                        'tkt_target' => 'required|integer',
                    ]);
                    $proposal->identity()->updateOrCreate(['proposal_id' => $id], $validated);
                    break;

                case 2: // Personnel
                    $validated = $request->validate([
                        'members' => 'required|array',
                        'members.*.user_id' => 'required|exists:users,id',
                        'members.*.role' => 'required|in:anggota,mahasiswa,teknisi',
                        'members.*.task_description' => 'required|string',
                    ]);

                    // Remove existing except chairman
                    ProposalPersonnel::where('proposal_id', $id)->where('role', '!=', 'ketua')->delete();
                    
                    foreach ($validated['members'] as $member) {
                        ProposalPersonnel::create(array_merge($member, ['proposal_id' => $id]));
                    }
                    break;

                case 3: // Outputs
                    $validated = $request->validate([
                        'outputs' => 'required|array',
                        'outputs.*.category' => 'required|in:mandatory,optional',
                        'outputs.*.type' => 'required|string',
                        'outputs.*.target_description' => 'required|string',
                    ]);

                    $proposal->outputs()->delete();
                    foreach ($validated['outputs'] as $output) {
                        $proposal->outputs()->create($output);
                    }
                    break;

                case 4: // Budget
                    $validated = $request->validate([
                        'budget_items' => 'required|array',
                        'budget_items.*.execution_year' => 'required|integer',
                        'budget_items.*.cost_group' => 'required|string',
                        'budget_items.*.item_name' => 'required|string',
                        'budget_items.*.quantity' => 'required|numeric',
                        'budget_items.*.unit' => 'required|string',
                        'budget_items.*.unit_cost' => 'required|numeric',
                    ]);

                    $proposal->budgetItems()->delete();
                    $totalBudget = 0;
                    foreach ($validated['budget_items'] as $item) {
                        $item['total_cost'] = $item['quantity'] * $item['unit_cost'];
                        $proposal->budgetItems()->create($item);
                        $totalBudget += $item['total_cost'];
                    }
                    $proposal->update(['budget' => $totalBudget]);
                    break;

                case 5: // Substance (Text)
                    $scheme = $proposal->scheme;
                    $validated = $request->validate([
                        'abstract' => 'required|string',
                        'keywords' => 'required|string|max:255',
                        'background' => 'required|string',
                        'methodology' => 'required|string',
                        'objectives' => 'required|string',
                        'references' => 'required|string',
                    ]);

                    // Word Count Validation logic (server-side)
                    $this->validateWordCount($validated['abstract'], $scheme->abstract_limit, 'Abstrak');
                    $this->validateWordCount($validated['background'], $scheme->background_limit, 'Latar Belakang');
                    $this->validateWordCount($validated['methodology'], $scheme->methodology_limit, 'Metode/Pembahasan');
                    $this->validateWordCount($validated['objectives'], $scheme->objective_limit, 'Tujuan/Kesimpulan');

                    $proposal->content()->updateOrCreate(['proposal_id' => $id], $validated);
                    break;
            }

            // Update current step to next if needed
            if ($proposal->current_step <= $step) {
                $proposal->update(['current_step' => $step + 1]);
            }

            DB::commit();
            return response()->json($proposal->load(['identity', 'personnel.user', 'outputs', 'budgetItems', 'content']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan tahap usulan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Submit Proposal
     */
    public function submit($id)
    {
        $proposal = Proposal::with(['personnel', 'identity'])->findOrFail($id);

        // Validasi Akhir
        if ($proposal->current_step < 6) {
            return response()->json(['message' => 'Harap selesaikan seluruh tahapan usulan (termasuk Substansi) sebelum mengirim.'], 422);
        }

        // Check Member Consents
        $pendingConsents = $proposal->personnel()->where('is_confirmed', false)->count();
        if ($pendingConsents > 0) {
            return response()->json(['message' => 'Terdapat ' . $pendingConsents . ' anggota yang belum memberikan persetujuan.'], 422);
        }

        $proposal->update(['status' => 'submitted']);

        return response()->json([
            'message' => 'Proposal berhasil dikirim ke LPPM.',
            'proposal' => $proposal
        ]);
    }

    /**
     * Download Endorsement PDF
     */
    public function downloadEndorsement($id)
    {
        $proposal = Proposal::with(['scheme', 'fiscalYear', 'user.dosenProfile', 'identity', 'personnel.user.dosenProfile'])
            ->findOrFail($id);

        $pdf = Pdf::loadView('pdf.proposal_endorsement', compact('proposal'));
        
        return $pdf->download('Lembar_Pengesahan_#' . $id . '.pdf');
    }

    /**
     * Display the specified resource.
     */
    public function show(Proposal $proposal)
    {
        return response()->json($proposal->load(['scheme', 'fiscalYear', 'reviews', 'identity', 'personnel.user', 'outputs', 'budgetItems', 'content', 'notes.user']));
    }

    /**
     * Update the specified resource in storage (Legacy/Internal)
     */
    public function update(Request $request, Proposal $proposal)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:draft,submitted,review,accepted,rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        $proposal->update($validated);

        return response()->json($proposal);
    }

    /**
     * Helper to validate word count
     */
    private function validateWordCount($text, $limit, $fieldName)
    {
        $wordCount = str_word_count(strip_tags($text));
        if ($wordCount > $limit) {
            throw new \Exception("Jumlah kata pada {$fieldName} melebihi batas (Maksimal {$limit} kata, saat ini {$wordCount} kata).");
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Proposal $proposal)
    {
        $proposal->delete();
        return response()->json(['message' => 'Proposal deleted']);
    }
}
