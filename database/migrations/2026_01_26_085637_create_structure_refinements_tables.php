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
        // Reports Table (Monev & Finals)
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals')->onDelete('cascade');
            $table->enum('type', ['progress', 'final', 'monev', 'logbook']);
            $table->string('file_path')->nullable(); // For documents/proofs
            $table->text('comments')->nullable(); // Reviewer comments
            $table->string('status')->default('submitted'); // submitted, approved, revision
            $table->timestamps();
        });

        // KKN Locations (Master Data)
        Schema::create('kkn_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fiscal_year_id')->constrained('fiscal_years')->onDelete('cascade');
            $table->string('name'); // Desa / Kecamatan
            $table->integer('quota')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Update Proposals for KKN
        Schema::table('proposals', function (Blueprint $table) {
            $table->foreignId('kkn_location_id')->nullable()->constrained('kkn_locations')->onDelete('set null');
            $table->foreignId('dpl_id')->nullable()->constrained('users')->onDelete('set null'); // Dosen Pembimbing
        });

        // Galleries
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_id')->constrained('galleries')->onDelete('cascade');
            $table->string('file_path');
            $table->enum('type', ['image', 'video']);
            $table->timestamps();
        });

        // Organization Structure
        Schema::create('organization_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('position');
            $table->string('image')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('structure_refinements_tables');
    }
};
