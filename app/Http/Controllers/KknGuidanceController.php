<?php

namespace App\Http\Controllers;

use App\Models\KknGuidanceTopic;
use App\Models\KknGuidanceMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KknGuidanceController extends Controller
{
    /**
     * List Topics for a Posto
     */
    public function index(Request $request)
    {
        $request->validate([
            'kkn_posto_id' => 'required|exists:kkn_postos,id'
        ]);

        $topics = KknGuidanceTopic::with(['user'])
            ->where('kkn_posto_id', $request->kkn_posto_id)
            ->latest()
            ->paginate(15);

        return response()->json($topics);
    }

    /**
     * Create New Topic (Thread)
     */
    public function store(Request $request)
    {
        $request->validate([
            'kkn_posto_id' => 'required|exists:kkn_postos,id',
            'title' => 'required|string|max:255',
            'initial_message' => 'required|string',
            'attachments.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB
        ]);

        $user = Auth::user();

        // Transaction to ensure atomic topic + first message
        $topic = \DB::transaction(function () use ($request, $user) {
            $topic = KknGuidanceTopic::create([
                'kkn_posto_id' => $request->kkn_posto_id,
                'user_id' => $user->id,
                'title' => $request->title,
                'status' => 'open'
            ]);

            $attachmentPaths = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('attachments/guidance', 'public');
                    $attachmentPaths[] = [
                        'path' => $path,
                        'name' => $file->getClientOriginalName(),
                        'mime' => $file->getClientMimeType(),
                        'size' => $file->getSize()
                    ];
                }
            }

            KknGuidanceMessage::create([
                'kkn_guidance_topic_id' => $topic->id,
                'user_id' => $user->id,
                'message' => $request->initial_message,
                'attachments' => count($attachmentPaths) > 0 ? $attachmentPaths : null,
            ]);

            return $topic;
        });

        return response()->json($topic, 201);
    }

    /**
     * Get Topic Details + Messages
     */
    public function show(string $id)
    {
        $topic = KknGuidanceTopic::with(['user', 'messages.user'])->findOrFail($id);
        return response()->json($topic);
    }

    /**
     * Post a Message (Reply)
     */
    public function storeMessage(Request $request, string $topicId)
    {
        $request->validate([
            'message' => 'required|string',
            'attachments.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB
        ]);

        $topic = KknGuidanceTopic::findOrFail($topicId); // Ensure topic exists
        
        if ($topic->status === 'closed') {
             return response()->json(['message' => 'Topic is closed'], 403);
        }

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('attachments/guidance', 'public');
                $attachmentPaths[] = [
                    'path' => $path,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize()
                ];
            }
        }

        $msg = KknGuidanceMessage::create([
            'kkn_guidance_topic_id' => $topicId,
            'user_id' => Auth::id(),
            'message' => $request->message,
            'attachments' => count($attachmentPaths) > 0 ? $attachmentPaths : null,
        ]);
        
        $msg->load('user');

        // Broadcast Event for Chat Realtime
        broadcast(new \App\Events\GuidanceMessageSent($msg))->toOthers();

        // Notify Recipients
        // If sender is DPL (Dosen), notify Topic Creator (Student)
        // If sender is Student, notify DPL
        
        $recipients = collect();
        
        // Add Topic Creator if not sender
        if ($topic->user_id !== Auth::id()) {
             $recipients->push($topic->user);
        }
        
        // Add DPL if not sender (and ensure DPL is linked to Posto)
        $dplId = $topic->posto->dpl_id;
        if ($dplId && $dplId !== Auth::id()) {
             $dpl = \App\Models\User::find($dplId);
             if ($dpl) {
                 $recipients->push($dpl);
             }
        }
        
        // Unique recipients
        $recipients = $recipients->unique('id');
        
        if ($recipients->isNotEmpty()) {
             \Illuminate\Support\Facades\Notification::send($recipients, new \App\Notifications\NewGuidanceMessage($msg));
        }

        return response()->json($msg, 201);
    }
}
