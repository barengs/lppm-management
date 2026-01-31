<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\KknRegistration;
use App\Models\KknRegistrationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class KknController extends Controller
{
    /**
     * Get student's KKN registration status with complete details
     */
    public function status(Request $request)
    {
        $user = Auth::user();
        
        // Get active fiscal year or specific one
        $fiscalYearId = $request->fiscal_year_id;
        
        $query = KknRegistration::with([
            'location',
            'fiscalYear',
            'dpl',
            'reviewer',
            'logs.creator'
        ])->where('student_id', $user->id);
        
        if ($fiscalYearId) {
            $query->where('fiscal_year_id', $fiscalYearId);
        }
        
        $registration = $query->latest()->first();
        
        if (!$registration) {
            return response()->json([
                'registration' => null,
                'profile' => $user->mahasiswaProfile,
                'message' => 'Belum ada pendaftaran KKN'
            ]);
        }
        
        return response()->json([
            'registration' => $registration,
            'profile' => $user->mahasiswaProfile,
        ]);
    }
    
    /**
     * Re-upload documents (only if status = needs_revision)
     */
    public function reupload(Request $request)
    {
        $user = Auth::user();
        
        $registration = KknRegistration::where('student_id', $user->id)
            ->latest()
            ->first();
            
        if (!$registration) {
            return response()->json([
                'message' => 'Pendaftaran tidak ditemukan'
            ], 404);
        }
        
        // Only allow re-upload if status is needs_revision
        if ($registration->status !== 'needs_revision') {
            return response()->json([
                'message' => 'Re-upload hanya diperbolehkan jika status "Perlu Revisi"'
            ], 403);
        }
        
        $validated = $request->validate([
            'krs_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'health_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'transcript_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);
        
        $documents = $registration->documents ?? [];
        $uploadedDocs = [];
        
        // Handle file uploads and delete old files
        if ($request->hasFile('krs_file')) {
            if (isset($documents['krs'])) {
                Storage::disk('public')->delete($documents['krs']);
            }
            $documents['krs'] = $request->file('krs_file')->store('kkn_documents', 'public');
            $uploadedDocs[] = 'KRS';
        }
        
        if ($request->hasFile('health_file')) {
            if (isset($documents['health'])) {
                Storage::disk('public')->delete($documents['health']);
            }
            $documents['health'] = $request->file('health_file')->store('kkn_documents', 'public');
            $uploadedDocs[] = 'Surat Sehat';
        }
        
        if ($request->hasFile('transcript_file')) {
            if (isset($documents['transcript'])) {
                Storage::disk('public')->delete($documents['transcript']);
            }
            $documents['transcript'] = $request->file('transcript_file')->store('kkn_documents', 'public');
            $uploadedDocs[] = 'Transkrip';
        }
        
        if ($request->hasFile('photo')) {
            if (isset($documents['photo'])) {
                Storage::disk('public')->delete($documents['photo']);
            }
            $documents['photo'] = $request->file('photo')->store('kkn_photos', 'public');
            $uploadedDocs[] = 'Foto';
        }
        
        if (empty($uploadedDocs)) {
            return response()->json([
                'message' => 'Tidak ada dokumen yang diupload'
            ], 400);
        }
        
        // Update documents
        $registration->update([
            'documents' => $documents,
            'status' => 'pending', // Reset to pending after re-upload
        ]);
        
        // Create log entry
        KknRegistrationLog::create([
            'registration_id' => $registration->id,
            'created_by' => $user->id,
            'action' => 'document_uploaded',
            'old_status' => 'needs_revision',
            'new_status' => 'pending',
            'note' => 'Mahasiswa mengupload ulang dokumen: ' . implode(', ', $uploadedDocs),
            'metadata' => [
                'uploaded_documents' => $uploadedDocs
            ]
        ]);
        
        return response()->json([
            'message' => 'Dokumen berhasil diupload ulang',
            'registration' => $registration->fresh(['location', 'fiscalYear', 'logs.creator'])
        ]);
    }
    
    /**
     * Get student's profile for KKN registration
     */
    public function profile()
    {
        $user = Auth::user();
        
        return response()->json([
            'user' => $user,
            'profile' => $user->mahasiswaProfile,
        ]);
    }
}
