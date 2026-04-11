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
        Schema::table('schemes', function (Blueprint $table) {
            $table->integer('abstract_limit')->default(200);
            $table->integer('background_limit')->default(500);
            $table->integer('methodology_limit')->default(1000);
            $table->integer('objective_limit')->default(300);
            $table->integer('reference_limit')->default(20); // Number of references
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schemes', function (Blueprint $table) {
            $table->dropColumn(['abstract_limit', 'background_limit', 'methodology_limit', 'objective_limit', 'reference_limit']);
        });
    }
};
