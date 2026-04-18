<?php

namespace App\Http\Controllers;

use App\Models\PkmProposal;
use App\Models\PkmPartner;
use App\Models\PkmPersonnel;
use App\Models\PkmSubstance;
use App\Models\PkmOutput;
use App\Models\PkmBudgetItem;
use App\Models\PkmDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\ProposalCoverSetting;
use App\Models\FiscalYear;
use Barryvdh\DomPDF\Facade\Pdf;

class PkmProposalController extends Controller
{
    /**
     * List PKM proposals for the authenticated user.
     */
    public function index()
    {
        $user = auth('api')->user();

        $proposals = PkmProposal::with(['fiscalYear', 'user'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('personnel', function ($sq) use ($user) {
                      $sq->where('user_id', $user->id)
                         ->where('type', 'dosen') // Lecturers only see where they are members
                         ->where('is_confirmed', true);
                  });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($proposals);
    }

    /**
     * Create a new PKM proposal (title + fiscal year only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'title'          => 'required|string|max:500',
        ]);

        $validated['user_id'] = auth('api')->id();
        $validated['status']  = 'draft';
        $validated['current_step'] = 0;

        $proposal = PkmProposal::create($validated);

        // Auto-add ketua
        PkmPersonnel::create([
            'pkm_proposal_id' => $proposal->id,
            'user_id'         => auth('api')->id(),
            'type'            => 'dosen',
            'role'            => 'ketua',
            'is_confirmed'    => true,
        ]);

        return response()->json($proposal, 201);
    }

    /**
     * Show a single PKM proposal with all relations.
     */
    public function show($id)
    {
        $proposal = PkmProposal::with([
            'fiscalYear',
            'user.dosenProfile',
            'personnel.user.dosenProfile',
            'partners',
            'substance',
            'outputs',
            'budgetItems',
            'documents',
        ])->findOrFail($id);

        return response()->json($proposal);
    }

    /**
     * Save per-step data for a PKM proposal.
     */
    public function saveStep(Request $request, $id)
    {
        $proposal = PkmProposal::findOrFail($id);
        $step = (int) $request->input('step');

        try {
            DB::beginTransaction();

            switch ($step) {
                case 0: // Identitas & Ringkasan + Skema
                    $validated = $request->validate([
                        'title'              => 'required|string|max:500',
                        'summary'            => 'nullable|string',
                        'substance_summary'  => 'required|string',
                        'keywords'           => 'required|string|max:500',
                        'scheme_group'       => 'required|string',
                        'scope'              => 'required|string',
                        'focus_area'         => 'required|string',
                        'duration_years'     => 'required|integer|min:1|max:3',
                        'first_year'         => 'required|integer|min:2020|max:2040',
                    ]);
                    $proposal->update($validated);
                    break;

                case 1: // Tim Pengusul
                    $data = $request->validate([
                        'members'                        => 'nullable|array',
                        'members.*.user_id'              => 'required|exists:users,id',
                        'members.*.role'                 => 'required|in:anggota',
                        'members.*.institution'          => 'nullable|string',
                        'members.*.study_program'        => 'nullable|string',
                        'members.*.sinta_id'             => 'nullable|string',
                        'members.*.science_cluster'      => 'nullable|string',
                        'members.*.task_description'     => 'required|string',
                        'students'                       => 'required|array|min:2',
                        'students.*.student_nim'         => 'required|string',
                        'students.*.student_name'        => 'required|string',
                        'students.*.student_prodi'       => 'nullable|string',
                        'students.*.student_university'  => 'nullable|string',
                        'students.*.task_description'    => 'required|string',
                    ], [
                        'students.min' => 'Wajib melibatkan minimal 2 mahasiswa sebagai anggota tim PKM.',
                    ]);

                    // Delete non-ketua personnel
                    PkmPersonnel::where('pkm_proposal_id', $id)
                        ->where('role', '!=', 'ketua')
                        ->delete();

                    // Add dosen members
                    if (!empty($data['members'])) {
                        foreach ($data['members'] as $member) {
                            PkmPersonnel::create(array_merge($member, [
                                'pkm_proposal_id' => $id,
                                'type'            => 'dosen',
                                'is_confirmed'    => false,
                            ]));
                        }
                    }

                    // Add manual students
                    foreach ($data['students'] as $student) {
                        PkmPersonnel::create(array_merge($student, [
                            'pkm_proposal_id' => $id,
                            'type'            => 'mahasiswa',
                            'role'            => 'mahasiswa',
                            'is_confirmed'    => true,
                        ]));
                    }
                    break;

                case 2: // Mitra Kerjasama
                    $data = $request->validate([
                        'partners'                        => 'required|array|min:1',
                        'partners.*.partner_category'     => 'required|string',
                        'partners.*.partner_name'         => 'required|string',
                        'partners.*.partner_description'  => 'nullable|string',
                        'partners.*.group_name'           => 'nullable|string',
                        'partners.*.leader_name'          => 'nullable|string',
                        'partners.*.group_type'           => 'nullable|string',
                        'partners.*.member_count'         => 'nullable|integer',
                        'partners.*.problem_scope_1'      => 'required|string',
                        'partners.*.problem_scope_2'      => 'nullable|string',
                        'partners.*.province'             => 'nullable|string',
                        'partners.*.city'                 => 'nullable|string',
                        'partners.*.district'             => 'nullable|string',
                        'partners.*.village'              => 'nullable|string',
                        'partners.*.address'              => 'nullable|string',
                    ]);

                    PkmPartner::where('pkm_proposal_id', $id)->delete();
                    foreach ($data['partners'] as $partner) {
                        $proposal->partners()->create($partner);
                    }
                    break;

                case 3: // SDGs
                    $data = $request->validate([
                        'sdg_goals'                    => 'required|array|min:1',
                        'sdg_goals.*.goal'             => 'required|string',
                        'sdg_goals.*.indicator'        => 'required|string', // angka indikator keberhasilan
                        'sdg_goals.*.description'      => 'required|string',
                    ]);

                    $substance = $proposal->substance()->firstOrNew(['pkm_proposal_id' => $id]);
                    $substance->fill(['sdg_goals' => $data['sdg_goals']])->save();
                    break;

                case 4: // Bidang Strategis
                    $data = $request->validate([
                        'strategic_fields'                      => 'required|array|min:1',
                        'strategic_fields.*.field'              => 'required|string',
                        'strategic_fields.*.problem_statement'  => 'required|string',
                        'strategic_fields.*.description'        => 'required|string',
                    ]);

                    $substance = $proposal->substance()->firstOrNew(['pkm_proposal_id' => $id]);
                    $substance->fill(['strategic_fields' => $data['strategic_fields']])->save();
                    break;

                case 5: // Luaran Dijanjikan
                    $data = $request->validate([
                        'outputs'               => 'required|array|min:1',
                        'outputs.*.year'        => 'nullable|integer',
                        'outputs.*.output_group'=> 'required|string',
                        'outputs.*.output_type' => 'required|string',
                        'outputs.*.target_status'=> 'required|string',
                        'outputs.*.notes'       => 'nullable|string',
                    ]);

                    PkmOutput::where('pkm_proposal_id', $id)->delete();
                    foreach ($data['outputs'] as $output) {
                        $proposal->outputs()->create($output);
                    }
                    break;

                case 6: // Anggaran (RAB)
                    $data = $request->validate([
                        'budget_items'               => 'required|array|min:1',
                        'budget_items.*.year'        => 'nullable|integer',
                        'budget_items.*.cost_group'  => 'required|string',
                        'budget_items.*.component'   => 'nullable|string',
                        'budget_items.*.item_name'   => 'required|string',
                        'budget_items.*.unit'        => 'required|string',
                        'budget_items.*.volume'      => 'required|numeric|min:0',
                        'budget_items.*.unit_cost'   => 'required|numeric|min:0',
                        'budget_items.*.url_price'   => 'nullable|string',
                    ]);

                    PkmBudgetItem::where('pkm_proposal_id', $id)->delete();
                    $total = 0;
                    foreach ($data['budget_items'] as $item) {
                        $item['total_cost'] = $item['volume'] * $item['unit_cost'];
                        $proposal->budgetItems()->create($item);
                        $total += $item['total_cost'];
                    }
                    $proposal->update(['budget' => $total]);
                    break;

                case 7: // Dokumen Pendukung (upload via separate endpoint)
                    // Step 7 is handled by uploadDocument(), this just advances step.
                    break;

                default:
                    return response()->json(['message' => 'Step tidak valid.'], 422);
            }

            // Advance current_step
            if ($proposal->current_step <= $step) {
                $proposal->update(['current_step' => $step + 1]);
            }

            DB::commit();

            return response()->json(
                $proposal->fresh()->load([
                    'fiscalYear', 'user',
                    'personnel.user.dosenProfile',
                    'partners', 'substance',
                    'outputs', 'budgetItems', 'documents',
                ])
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan tahap PKM: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload a support document for a PKM proposal.
     */
    public function uploadDocument(Request $request, $id)
    {
        $proposal = PkmProposal::findOrFail($id);

        $request->validate([
            'document_type' => 'required|string',
            'file'          => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $path = $request->file('file')->store("pkm_documents/{$id}", 'public');

        // Remove existing same-type document
        $existing = PkmDocument::where('pkm_proposal_id', $id)
            ->where('document_type', $request->document_type)
            ->first();

        if ($existing) {
            Storage::disk('public')->delete($existing->file_path);
            $existing->delete();
        }

        $doc = PkmDocument::create([
            'pkm_proposal_id' => $id,
            'document_type'   => $request->document_type,
            'file_path'       => $path,
            'original_name'   => $request->file('file')->getClientOriginalName(),
        ]);

        return response()->json($doc);
    }

    /**
     * Submit the PKM proposal.
     */
    public function submit($id)
    {
        $proposal = PkmProposal::with('personnel')->findOrFail($id);

        if ($proposal->current_step < 7) {
            return response()->json([
                'message' => 'Harap selesaikan seluruh 8 tahap pengisian sebelum mengirim PKM.'
            ], 422);
        }

        $proposal->update(['status' => 'submitted']);

        return response()->json([
            'message'  => 'Proposal PKM berhasil dikirim ke LPPM.',
            'proposal' => $proposal,
        ]);
    }

    /**
     * Delete a PKM proposal (only if still draft).
     */
    public function destroy($id)
    {
        $proposal = PkmProposal::where('user_id', auth('api')->id())->findOrFail($id);

        if ($proposal->status !== 'draft') {
            return response()->json(['message' => 'Hanya proposal berstatus draft yang dapat dihapus.'], 422);
        }

        $proposal->delete();

        return response()->json(['message' => 'Proposal PKM berhasil dihapus.']);
    }

    /**
     * Download full proposal PDF including configured cover page for PKM.
     */
    public function downloadFull($id)
    {
        $proposal = PkmProposal::with(['fiscalYear', 'user.dosenProfile', 'personnel.user.dosenProfile'])
            ->findOrFail($id);

        $setting = ProposalCoverSetting::where('type', 'pkm')->first();
        
        $year = $proposal->fiscalYear->year ?? date('Y');

        $pdf = Pdf::loadView('pdf.proposal_full', compact('proposal', 'setting', 'year'));
        
        return $pdf->download('Proposal_PKM_#' . $id . '.pdf');
    }
}
