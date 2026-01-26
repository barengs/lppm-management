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
        // 1. Fiscal Years
        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->id();
            $table->year('year');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        // 2. Schemes
        Schema::create('schemes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['research', 'abmas', 'kkn']);
            $table->decimal('max_budget', 15, 2)->default(0);
            $table->string('guideline_file')->nullable();
            $table->timestamps();
        });

        // 3. Proposals
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('scheme_id')->constrained('schemes')->onDelete('cascade');
            $table->foreignId('fiscal_year_id')->constrained('fiscal_years')->onDelete('cascade');
            $table->string('title');
            $table->string('location')->nullable(); // For KKN
            $table->text('abstract')->nullable();
            $table->string('file_proposal')->nullable();
            $table->enum('status', ['draft', 'submitted', 'review', 'accepted', 'rejected'])->default('draft');
            $table->timestamps();
        });

        // 4. Reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->integer('score')->default(0);
            $table->text('comment')->nullable();
            $table->enum('decision', ['accepted', 'rejected', 'revision'])->nullable();
            $table->timestamps();
        });

        // 5. Activity Logs (Logbook)
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals')->onDelete('cascade');
            $table->date('date');
            $table->text('activity_description');
            $table->string('proof_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('proposals');
        Schema::dropIfExists('schemes');
        Schema::dropIfExists('fiscal_years');
    }
};
