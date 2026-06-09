<?php

namespace App\Imports;

use App\Models\KknRegistration;
use App\Models\KknGrade;
use App\Models\KknPosto;
use App\Models\MahasiswaProfile;
use App\Models\KknGradingSetting;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class KknGradesImport implements ToCollection, WithHeadingRow
{
    protected $user;
    protected $importedCount = 0;
    protected $errors = [];

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function collection(Collection $rows)
    {
        $isAdminOrLppm = $this->user->hasAnyRole(['admin', 'ketua_lppm', 'staff', 'staff_kkn']);
        
        // Find DPL postos if not admin
        $postoIds = [];
        if (!$isAdminOrLppm) {
            $postoIds = KknPosto::where('dpl_id', $this->user->id)->pluck('id')->toArray();
        }

        foreach ($rows as $row) {
            $npm = isset($row['npm']) ? trim($row['npm']) : null;
            if (!$npm || $npm === '-') {
                continue;
            }

            // Find the student profile
            $profile = MahasiswaProfile::where('npm', $npm)->first();
            if (!$profile) {
                $this->errors[] = "Mahasiswa dengan NPM {$npm} tidak ditemukan di sistem.";
                continue;
            }

            // Find the KKN registration
            $registration = KknRegistration::where('student_id', $profile->user_id)
                ->where('status', 'approved')
                ->first();

            if (!$registration) {
                $this->errors[] = "Registrasi KKN aktif untuk NPM {$npm} tidak ditemukan.";
                continue;
            }

            // Check DPL authorization
            if (!$isAdminOrLppm) {
                $posto = $registration->kknPosto;
                if (!$posto || !in_array($posto->id, $postoIds)) {
                    $this->errors[] = "Anda tidak memiliki akses untuk menilai NPM {$npm} (bukan di posko bimbingan Anda).";
                    continue;
                }
            }

            // Fetch settings to validate max scores
            $settings = null;
            if ($registration->kkn_period_id) {
                $settings = KknGradingSetting::where('kkn_period_id', $registration->kkn_period_id)->first();
            }

            // Extract scores
            // Check keys created by maatwebsite slugifying: m1_mgg_1, m2_mgg_2, m3_mgg_3, m4_mgg_4, nilai_sekunder, nilai_artikel
            $w1 = isset($row['m1_mgg_1']) && $row['m1_mgg_1'] !== '-' && $row['m1_mgg_1'] !== '' ? (float)$row['m1_mgg_1'] : null;
            $w2 = isset($row['m2_mgg_2']) && $row['m2_mgg_2'] !== '-' && $row['m2_mgg_2'] !== '' ? (float)$row['m2_mgg_2'] : null;
            $w3 = isset($row['m3_mgg_3']) && $row['m3_mgg_3'] !== '-' && $row['m3_mgg_3'] !== '' ? (float)$row['m3_mgg_3'] : null;
            $w4 = isset($row['m4_mgg_4']) && $row['m4_mgg_4'] !== '-' && $row['m4_mgg_4'] !== '' ? (float)$row['m4_mgg_4'] : null;
            $secondary = isset($row['nilai_sekunder']) && $row['nilai_sekunder'] !== '-' && $row['nilai_sekunder'] !== '' ? (float)$row['nilai_sekunder'] : null;
            $article = isset($row['nilai_artikel']) && $row['nilai_artikel'] !== '-' && $row['nilai_artikel'] !== '' ? (float)$row['nilai_artikel'] : null;

            // Validate max limits
            if ($settings) {
                if ($w1 !== null && $w1 > $settings->w1_max) {
                    $this->errors[] = "Nilai M1 untuk NPM {$npm} ({$w1}) melebihi batas maksimum ({$settings->w1_max}).";
                    continue;
                }
                if ($w2 !== null && $w2 > $settings->w2_max) {
                    $this->errors[] = "Nilai M2 untuk NPM {$npm} ({$w2}) melebihi batas maksimum ({$settings->w2_max}).";
                    continue;
                }
                if ($w3 !== null && $w3 > $settings->w3_max) {
                    $this->errors[] = "Nilai M3 untuk NPM {$npm} ({$w3}) melebihi batas maksimum ({$settings->w3_max}).";
                    continue;
                }
                if ($w4 !== null && $w4 > $settings->w4_max) {
                    $this->errors[] = "Nilai M4 untuk NPM {$npm} ({$w4}) melebihi batas maksimum ({$settings->w4_max}).";
                    continue;
                }
                if ($secondary !== null && $secondary > $settings->secondary_max) {
                    $this->errors[] = "Nilai Sekunder untuk NPM {$npm} ({$secondary}) melebihi batas maksimum ({$settings->secondary_max}).";
                    continue;
                }
                if ($isAdminOrLppm && $article !== null && $article > $settings->article_max) {
                    $this->errors[] = "Nilai Artikel untuk NPM {$npm} ({$article}) melebihi batas maksimum ({$settings->article_max}).";
                    continue;
                }
            }

            // Save or update grade
            $grade = KknGrade::firstOrNew(['kkn_registration_id' => $registration->id]);
            
            $gradeData = [
                'graded_by'       => $grade->graded_by ?? $this->user->id,
                'dpl_id'          => $grade->dpl_id ?? $this->user->id,
                'w1_score'        => $w1 ?? $grade->w1_score,
                'w2_score'        => $w2 ?? $grade->w2_score,
                'w3_score'        => $w3 ?? $grade->w3_score,
                'w4_score'        => $w4 ?? $grade->w4_score,
                'secondary_score' => $secondary ?? $grade->secondary_score,
            ];

            if ($isAdminOrLppm && $article !== null) {
                $gradeData['article_score'] = $article;
                $gradeData['article_graded_by'] = $this->user->id;
            }

            $grade->fill($gradeData);

            if (!$grade->certificate_number) {
                $grade->certificate_number = 'KKN-' . date('Y') . '-' . $npm;
            }

            $grade->save();
            $grade->recalculate();
            $this->importedCount++;
        }
    }

    public function getImportedCount()
    {
        return $this->importedCount;
    }

    public function getErrors()
    {
        return $this->errors;
    }
}
