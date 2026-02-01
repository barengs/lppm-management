<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kkn_posto_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_posto_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('kkn_registration_id')->nullable()->constrained('kkn_registrations')->onDelete('set null');
            $table->enum('position', ['kordes', 'sekretaris', 'bendahara', 'humas', 'publikasi', 'anggota'])->default('anggota');
            $table->enum('status', ['active', 'inactive', 'withdrawn'])->default('active');
            $table->date('joined_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Unique constraint: one student can only be in one posto once
            $table->unique(['student_id', 'kkn_posto_id'], 'unique_student_posto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_posto_members');
    }
};
