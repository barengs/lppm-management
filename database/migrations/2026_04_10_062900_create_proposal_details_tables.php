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
        // A. Identity Details
        Schema::create('proposal_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals')->onDelete('cascade');
            $table->integer('duration_years')->default(1);
            $table->string('science_cluster_level_3')->nullable(); // Rumpun Ilmu
            $table->string('focus_area')->nullable(); // Bidang Fokus
            $table->string('research_theme')->nullable();
            $table->string('research_topic')->nullable();
            $table->integer('tkt_initial')->default(1);
            $table->integer('tkt_target')->default(1);
            $table->timestamps();
        });

        // B. Personnel Details
        Schema::create('proposal_personnel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nidn_nik')->nullable();
            $table->enum('role', ['ketua', 'anggota', 'mahasiswa', 'teknisi']);
            $table->boolean('is_confirmed')->default(false);
            $table->decimal('sinta_score_3_years', 10, 2)->default(0);
            $table->text('task_description')->nullable();
            $table->timestamps();
        });

        // C. Outputs
        Schema::create('proposal_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals')->onDelete('cascade');
            $table->enum('category', ['mandatory', 'optional']);
            $table->string('type'); // Jurnal, Buku, HKI, dll
            $table->string('target_description'); // Nama Jurnal Q1, dll
            $table->enum('status_target', ['draft', 'accepted', 'published'])->default('draft');
            $table->timestamps();
        });

        // D. Budget Items
        Schema::create('proposal_budget_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals')->onDelete('cascade');
            $table->integer('execution_year')->default(1);
            $table->enum('cost_group', ['salary', 'materials', 'travel', 'others']);
            $table->string('item_name');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('unit');
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_budget_items');
        Schema::dropIfExists('proposal_outputs');
        Schema::dropIfExists('proposal_personnel');
        Schema::dropIfExists('proposal_identities');
    }
};
