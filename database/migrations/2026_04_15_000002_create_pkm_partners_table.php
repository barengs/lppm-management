<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkm_partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pkm_proposal_id')->constrained()->onDelete('cascade');
            // Kategori mitra: sasaran (kelompok masyarakat), pemerintah, dudi, pt
            $table->string('partner_category')->default('sasaran'); // sasaran/mitra_pemerintah/mitra_dudi/mitra_pt
            $table->string('group_name')->nullable();
            $table->string('leader_name')->nullable();
            $table->string('group_type')->nullable();  // jenis kelompok (petani, nelayan, dll)
            $table->unsignedInteger('member_count')->nullable();
            $table->text('problem_scope_1')->nullable();  // permasalahan prioritas 1
            $table->text('problem_scope_2')->nullable();  // permasalahan prioritas 2
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->string('village')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkm_partners');
    }
};
