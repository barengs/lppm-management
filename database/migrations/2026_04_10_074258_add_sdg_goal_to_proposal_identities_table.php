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
        Schema::table('proposal_identities', function (Blueprint $table) {
            $table->string('sdg_goal')->nullable()->after('research_topic');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposal_identities', function (Blueprint $table) {
            $table->dropColumn('sdg_goal');
        });
    }
};
