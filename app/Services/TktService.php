<?php

namespace App\Services;

class TktService
{
    /**
     * Get TKT Questions for Research
     */
    public static function getQuestions()
    {
        return [
            1 => [
                'name' => 'Tingkat 1: Prinsip dasar dari teknologi telah diteliti dan dilaporkan',
                'indicators' => [
                    ['id' => 101, 'text' => 'Asumsi dan hukum dasar (fisika/ekonomi/sosial) telah ditentukan'],
                    ['id' => 102, 'text' => 'Studi literatur tentang prinsip dasar teknologi telah selesai'],
                    ['id' => 103, 'text' => 'Komponen dasar teknologi telah diidentifikasi'],
                ]
            ],
            2 => [
                'name' => 'Tingkat 2: Formulasi Konsep Teknologi dan Aplikasinya',
                'indicators' => [
                    ['id' => 201, 'text' => 'Aplikasi praktis teknologi telah dikaji'],
                    ['id' => 202, 'text' => 'Konsep teknologi dan aplikasinya telah diformulasikan'],
                    ['id' => 203, 'text' => 'Analisis teoritis dan desain awal telah dilakukan'],
                ]
            ],
            3 => [
                'name' => 'Tingkat 3: Pembuktian Konsep (Proof of Concept) secara Analitis dan Eksperimental',
                'indicators' => [
                    ['id' => 301, 'text' => 'Studi analitik telah dilakukan untuk membuktikan deskripsi teknologi'],
                    ['id' => 302, 'text' => 'Komponen teknologi telah diuji di laboratorium'],
                    ['id' => 303, 'text' => 'Model awal (mock-up) telah dibuat dan diuji'],
                ]
            ],
            4 => [
                'name' => 'Tingkat 4: Validasi Komponen/Sistem dalam lingkungan laboratorium',
                'indicators' => [
                    ['id' => 401, 'text' => 'Integrasi komponen dalam skala laboratorium'],
                    ['id' => 402, 'text' => 'Pengujian performa komponen tunggal'],
                ]
            ],
            5 => ['name' => 'Tingkat 5: Validasi Komponen/Sistem dalam lingkungan relevan', 'indicators' => [['id' => 501, 'text' => 'Pengujian dalam lingkungan simulasi']]],
            6 => ['name' => 'Tingkat 6: Demonstrasi Model/Prototipe Sistem dalam lingkungan relevan', 'indicators' => [['id' => 601, 'text' => 'Prototipe mendekati kinerja operasional']]],
            7 => ['name' => 'Tingkat 7: Demonstrasi Prototipe Sistem dalam lingkungan operasional', 'indicators' => [['id' => 701, 'text' => 'Pengujian lapangan skala operasional']]],
            8 => ['name' => 'Tingkat 8: Sistem telah lengkap dan teruji melalui pengujian dan demonstrasi', 'indicators' => [['id' => 801, 'text' => 'Sistem siap untuk diproduksi/implementasi luas']]],
            9 => ['name' => 'Tingkat 9: Sistem benar-benar teruji dalam lingkungan sebenarnya', 'indicators' => [['id' => 901, 'text' => 'Teknologi siap untuk komersialisasi/diseminasi']]],
        ];
    }

    /**
     * Calculate Level based on answers
     * Answers is array of id => boolean
     */
    public static function calculateLevel(array $answers)
    {
        $questions = self::getQuestions();
        $achievedLevel = 0;
        $totalPoints = 0;
        $maxPoints = 0;

        foreach ($questions as $level => $data) {
            $levelPoints = 0;
            $levelMax = count($data['indicators']);
            
            foreach ($data['indicators'] as $indicator) {
                if (isset($answers[$indicator['id']]) && ($answers[$indicator['id']] === true || $answers[$indicator['id']] === 1 || $answers[$indicator['id']] === '1')) {
                    $levelPoints++;
                    $totalPoints++;
                }
                $maxPoints++;
            }

            // A level is achieved if at least 80% indicators are Yes
            if ($levelMax > 0 && ($levelPoints / $levelMax >= 0.8)) {
                $achievedLevel = $level;
            } else {
                // If this level is not achieved, stop.
                break;
            }
        }

        return [
            'level' => $achievedLevel,
            'score' => $maxPoints > 0 ? ($totalPoints / $maxPoints) * 100 : 0,
            'points' => $totalPoints
        ];
    }
}
