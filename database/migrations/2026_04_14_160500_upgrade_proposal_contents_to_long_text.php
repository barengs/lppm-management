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
        Schema::table('proposal_contents', function (Blueprint $table) {
            $table->longText('abstract')->nullable()->change();
            $table->longText('background')->nullable()->change();
            $table->longText('methodology')->nullable()->change();
            $table->longText('objectives')->nullable()->change();
            $table->longText('references')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposal_contents', function (Blueprint $table) {
            $table->text('abstract')->nullable()->change();
            $table->text('background')->nullable()->change();
            $table->text('methodology')->nullable()->change();
            $table->text('objectives')->nullable()->change();
            $table->text('references')->nullable()->change();
        });
    }
};
