<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkm_personnel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pkm_proposal_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // null for manual students
            $table->string('type')->default('dosen'); // dosen / mahasiswa
            $table->string('role')->default('anggota'); // ketua / anggota
            $table->string('sinta_id')->nullable();
            $table->string('science_cluster')->nullable(); // rumpun ilmu dari profil atau manual
            $table->text('task_description')->nullable();
            // Data mahasiswa manual
            $table->string('student_nim')->nullable();
            $table->string('student_name')->nullable();
            $table->string('student_prodi')->nullable();
            $table->string('student_university')->nullable();
            $table->boolean('is_confirmed')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkm_personnel');
    }
};
