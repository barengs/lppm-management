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
        // Science Clusters (Rumpun Ilmu)
        Schema::create('master_science_clusters', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('level'); // 1, 2, 3
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('master_science_clusters')->onDelete('cascade');
        });

        // Research Priorities (Bidang Fokus, Tema, Topik)
        Schema::create('master_research_priorities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['focus_area', 'theme', 'topic']);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('master_research_priorities')->onDelete('cascade');
        });

        // Generic Selections (Roles, Output Types, Cost Groups)
        Schema::create('master_selections', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // e.g., 'personnel_role', 'output_type', 'cost_group'
            $table->string('key');  // The value saved to DB
            $table->string('label'); // The human-readable label
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_selections');
        Schema::dropIfExists('master_research_priorities');
        Schema::dropIfExists('master_science_clusters');
    }
};
