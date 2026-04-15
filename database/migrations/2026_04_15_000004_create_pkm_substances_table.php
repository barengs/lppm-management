<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkm_substances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pkm_proposal_id')->constrained()->onDelete('cascade');
            // Asta Cita
            $table->string('asta_cita_indicator')->nullable();
            $table->text('asta_cita_description')->nullable();
            // SDGs: array of {goal: string, indicator: string, description: string}
            $table->json('sdg_goals')->nullable();
            // 8 Bidang Strategis: array of {field: string, problem_statement: string, description: string}
            $table->json('strategic_fields')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkm_substances');
    }
};
