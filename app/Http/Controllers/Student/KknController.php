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
                'profile' => $user->mahasiswaProfile()->with(['faculty', 'studyProgram'])->first(),
                'message' => 'Belum ada pendaftaran KKN'
            ]);
        }
        
        return response()->json([
            'registration' => $registration,
            'profile' => $user->mahasiswaProfile()->with(['faculty', 'studyProgram'])->first(),
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
        
        $uploadedDocs = [];
        $files = $request->allFiles();
        
        if (empty($files)) {
            return response()->json([
                'message' => 'Tidak ada dokumen yang diupload'
            ], 400);
        }

        foreach ($files as $key => $file) {
            // Find document by ID if key is 'doc_ID' or 'DOC_TYPE'
            $doc = null;
            if (str_starts_with($key, 'doc_')) {
                $docId = substr($key, 4);
                $doc = \App\Models\KknRegistrationDocument::find($docId);
            } else {
                // Find by doc_type match
                $docType = $key;
                // Map some common frontend keys to doc_types if needed
                if ($key === 'transcript_file') $docType = 'transkrip';
                if ($key === 'health_file') $docType = 'sehat';
                if ($key === 'krs_file') $docType = 'krs';
                if ($key === 'photo') $docType = 'required_photo';
                
                $doc = $registration->kknRegistrationDocuments()->where('doc_type', $docType)->first();
            }

            if ($doc && $doc->kkn_registration_id == $registration->id) {
                // Delete old file
                if ($doc->file_path) {
                    Storage::disk('public')->delete($doc->file_path);
                }
                
                // Store new file
                $directory = ($doc->doc_type === 'required_photo' || $key === 'photo') ? 'kkn_photos' : 'kkn_documents';
                $path = $file->store($directory, 'public');
                
                $doc->update(['file_path' => $path]);
                $uploadedDocs[] = $doc->name;
            }
        }
        
        if (empty($uploadedDocs)) {
            return response()->json([
                'message' => 'Tidak ada dokumen valid yang diupdate. Pastikan dokumen yang Anda upload sesuai.'
            ], 400);
        }
        
        // Update registration status
        $registration->update([
            'status' => 'pending', // Reset to pending after re-upload
        ]);
        
        // Create log entry
        KknRegistrationLog::create([
            'registration_id' => $registration->id,
            'created_by' => $user->id,
            'action' => 'document_uploaded',
            'old_status' => 'needs_revision',
            'new_status' => 'pending',
            'note' => 'Mahasiswa merevisi dokumen: ' . implode(', ', $uploadedDocs),
            'metadata' => [
                'uploaded_documents' => $uploadedDocs
            ]
        ]);
        
        return response()->json([
            'message' => 'Dokumen berhasil direvisi dan sedang menunggu review ulang.',
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
            'profile' => $user->mahasiswaProfile()->with(['faculty', 'studyProgram'])->first(),
        ]);
    }
}
