<?php

namespace App\Http\Controllers;

use App\Models\JournalConsultation;
use App\Models\JournalConsultationMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JournalConsultationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth('api')->user();

        if ($user->hasRole(['admin', 'lppm'])) {
            $consultations = JournalConsultation::with('user')->orderBy('updated_at', 'desc')->get();
        } else {
            $consultations = JournalConsultation::where('user_id', $user->id)->orderBy('updated_at', 'desc')->get();
        }

        return response()->json($consultations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth('api')->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'nullable|string',
            'target_publisher' => 'nullable|string',
            'initial_file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // Create Consultation
        $consultation = JournalConsultation::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'abstract' => $validated['abstract'] ?? null,
            'target_publisher' => $validated['target_publisher'] ?? null,
            'status' => 'pending',
        ]);

        // If file provided, add as first message
        if ($request->hasFile('initial_file')) {
            $path = $request->file('initial_file')->store('journal_docs', 'public');
            
            JournalConsultationMessage::create([
                'journal_consultation_id' => $consultation->id,
                'user_id' => $user->id,
                'message' => 'Initial Draft',
                'file_path' => $path,
                'file_name' => $request->file('initial_file')->getClientOriginalName(),
            ]);
        }

        return response()->json($consultation, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $consultation = JournalConsultation::with(['user', 'messages.user'])->findOrFail($id);
        
        // Authorization check
        $user = auth('api')->user();
        if ($user->id !== $consultation->user_id && !$user->hasRole(['admin', 'lppm'])) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($consultation);
    }

    /**
     * Store a new message (reply) in the consultation.
     */
    public function storeMessage(Request $request, $id)
    {
        $consultation = JournalConsultation::findOrFail($id);
        
        $validated = $request->validate([
            'message' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240',
        ]);

        if (!$validated['message'] && !$request->hasFile('file')) {
            return response()->json(['message' => 'Message or file is required'], 422);
        }

        $user = auth('api')->user();
        
        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('journal_docs', 'public');
            $fileName = $request->file('file')->getClientOriginalName();
        }

        $message = JournalConsultationMessage::create([
            'journal_consultation_id' => $consultation->id,
            'user_id' => $user->id,
            'message' => $validated['message'] ?? '',
            'file_path' => $filePath,
            'file_name' => $fileName,
        ]);

        // Touch the updated_at timestamp of the consultation
        $consultation->touch();

        return response()->json($message->load('user'), 201);
    }

    /**
     * Update status (Admin/LPPM only).
     */
    public function updateStatus(Request $request, $id)
    {
        $user = auth('api')->user();
        if (!$user->hasRole(['admin', 'lppm'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultation = JournalConsultation::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,in_review,revision_needed,approved,rejected'
        ]);

        $consultation->update(['status' => $validated['status']]);

        return response()->json($consultation);
    }
}
