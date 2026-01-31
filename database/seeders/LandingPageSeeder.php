<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agenda;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Str;

class LandingPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate existing data to avoid duplicates/mess (optional, but good for dev)
        // Schema::disableForeignKeyConstraints();
        // Agenda::truncate();
        // Post::truncate();
        // Schema::enableForeignKeyConstraints();

        $admin = User::first();
        if (!$admin) {
            $this->command->info('No user found! Please run DatabaseSeeder first.');
            return;
        }

        // --- AGENDAS ---
        Agenda::create([
            'title' => 'Diseminasi Hasil Penelitian Dosen',
            'event_date' => now()->addDays(5)->toDateString(),
            'location' => 'Auditorium UIM',
            'description' => 'Diseminasi hasil penelitian hibah internal dan eksternal tahun anggaran 2025. Wajib dihadiri oleh seluruh dosen penerima hibah.'
        ]);

        Agenda::create([
            'title' => 'Workshop Metodologi Riset Kuantitatif',
            'event_date' => now()->addDays(12)->toDateString(),
            'location' => 'Laboratorium Komputer Lt. 3',
            'description' => 'Workshop peningkatan kompetensi dosen dalam pengolahan data menggunakan SPSS dan SEM-AMOS.'
        ]);
        
        Agenda::create([
            'title' => 'Batas Akhir Upload Laporan Kemajuan',
            'event_date' => now()->addDays(20)->toDateString(),
            'location' => 'Online (Sistem LPPM)',
            'description' => 'Batas akhir pengunggahan laporan kemajuan penelitian dan pengabdian bagi penerima hibah tahap I.'
        ]);

        // --- POSTS: NEWS ---
        $newsItems = [
            [
                'title' => 'Dosen UIM Raih Hibah Penelitian Kompetitif Nasional 2026',
                'content' => '<p>Universitas Islam Madura kembali menorehkan prestasi. Sebanyak 5 tim dosen berhasil memenangkan pendanaan Hibah Penelitian Kompetitif Nasional dari Kemdikbud Ristek tahun 2026.</p><p>Rektor UIM menyampaikan apresiasi setinggi-tingginya atas pencapaian ini...</p>',
                'thumbnail' => 'https://source.unsplash.com/random/800x600?university,celebration'
            ],
            [
                'title' => 'KKN Tematik 2026 Resmi Dilepas oleh Bupati Pamekasan',
                'content' => '<p>Ribuan mahasiswa UIM resmi diberangkatkan menuju lokasi KKN Tematik di 50 desa se-Kabupaten Pamekasan. Pelepasan dilakukan langsung oleh Bupati di Pendopo Kabupaten.</p><p>Tema KKN tahun ini adalah "Pemberdayaan Ekonomi Masyarakat Berbasis Potensi Lokal".</p>',
                'thumbnail' => 'https://source.unsplash.com/random/800x600?students,community'
            ],
            [
                'title' => 'LPPM Gelar Pelatihan Penulisan Artikel Ilmiah Bereputasi',
                'content' => '<p>Untuk meningkatkan publikasi internasional, LPPM UIM mengadakan pelatihan intensif penulisan jurnal terindeks Scopus. Kegiatan ini menghadirkan narasumber dari...</p>',
                'thumbnail' => 'https://source.unsplash.com/random/800x600?writing,workshop'
            ]
        ];

        foreach ($newsItems as $news) {
            Post::create([
                'title' => $news['title'],
                'slug' => Str::slug($news['title']),
                'content' => $news['content'],
                'category' => 'news',
                'thumbnail' => $news['thumbnail'],
                'is_published' => true,
                'created_by' => $admin->id
            ]);
        }

        // --- POSTS: ANNOUNCEMENTS ---
        $announcements = [
            'Penerimaan Proposal Penelitian Internal Tahun 2026 Telah Dibuka',
            'Jadwal Upload Laporan Kemajuan Penelitian & Pengabdian',
            'Pengumuman Hasil Seleksi Administrasi KKN 2026',
            'Himbauan Pengkinian Data SINTA bagi Dosen'
        ];

        foreach ($announcements as $title) {
            Post::create([
                'title' => $title,
                'slug' => Str::slug($title),
                'content' => "<p>Detail informasi mengenai {$title} dapat diunduh pada lampiran dokumen terkait atau menghubungi bagian administrasi LPPM.</p>",
                'category' => 'announcement',
                'is_published' => true,
                'created_by' => $admin->id
            ]);
        }

        // --- POST: VIDEO ---
        Post::create([
            'title' => 'Dokumentasi Seminar Nasional Hasil Pengabdian 2025',
            'slug' => 'video-seminar-nasional-2025',
            'content' => '<p>Highlight kegiatan Seminar Nasional yang diselenggarakan pada tanggal 20 Desember 2025.</p>',
            'category' => 'news',
            'video_url' => 'https://www.youtube.com/watch?v=LXb3EKWsInQ', // 4K Landscape nature video example (safe)
            'thumbnail' => 'https://source.unsplash.com/random/800x600?seminar',
            'is_published' => true,
            'created_by' => $admin->id
        ]);
        
    }
}
