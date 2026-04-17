<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. pkm_proposals: tambah field identitas skema
        Schema::table('pkm_proposals', function (Blueprint $table) {
            $table->string('scheme_group')->nullable()->after('title');     // Kelompok Skema
            $table->string('scope')->nullable()->after('scheme_group');     // Ruang Lingkup
            $table->string('focus_area')->nullable()->after('scope');       // Bidang Fokus
            $table->unsignedTinyInteger('duration_years')->default(1)->after('focus_area'); // Lama Kegiatan
            $table->unsignedSmallInteger('first_year')->nullable()->after('duration_years'); // Tahun Pertama Usulan
        });

        // 2. pkm_personnel: tambah institution & study_program untuk dosen
        Schema::table('pkm_personnel', function (Blueprint $table) {
            $table->string('institution')->nullable()->after('science_cluster');   // Perguruan Tinggi/Institusi
            $table->string('study_program')->nullable()->after('institution');     // Program Studi/Bagian
        });

        // 3. pkm_partners: sesuaikan field dengan form BIMA
        Schema::table('pkm_partners', function (Blueprint $table) {
            // Nama mitra sasaran (berbeda dari group_name yang bisa jadi nama instansi)
            $table->string('partner_name')->nullable()->after('partner_category');        // Nama Mitra Sasaran
            $table->text('partner_description')->nullable()->after('partner_name');       // Kelompok Mitra Sasaran (deskripsi)
            // File uploads
            $table->string('distance_proof_file')->nullable()->after('address');          // File Bukti Jarak
            $table->string('cooperation_letter_file')->nullable()->after('distance_proof_file'); // Surat Pernyataan Kerjasama
        });

        // 4. pkm_substances: drop asta_cita (tidak diperlukan)
        Schema::table('pkm_substances', function (Blueprint $table) {
            $table->dropColumn(['asta_cita_indicator', 'asta_cita_description']);
        });
    }

    public function down(): void
    {
        Schema::table('pkm_proposals', function (Blueprint $table) {
            $table->dropColumn(['scheme_group', 'scope', 'focus_area', 'duration_years', 'first_year']);
        });
        Schema::table('pkm_personnel', function (Blueprint $table) {
            $table->dropColumn(['institution', 'study_program']);
        });
        Schema::table('pkm_partners', function (Blueprint $table) {
            $table->dropColumn(['partner_name', 'partner_description', 'distance_proof_file', 'cooperation_letter_file']);
        });
        Schema::table('pkm_substances', function (Blueprint $table) {
            $table->string('asta_cita_indicator')->nullable();
            $table->text('asta_cita_description')->nullable();
        });
    }
};
