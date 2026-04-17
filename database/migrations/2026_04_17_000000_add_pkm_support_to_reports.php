<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('proposal_id')->nullable()->change();
            $table->foreignId('pkm_proposal_id')->nullable()->after('proposal_id')->constrained('pkm_proposals')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['pkm_proposal_id']);
            $table->dropColumn('pkm_proposal_id');
            $table->foreignId('proposal_id')->nullable(false)->change();
        });
    }
};
