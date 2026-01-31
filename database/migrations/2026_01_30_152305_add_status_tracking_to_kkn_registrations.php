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
        Schema::table('kkn_registrations', function (Blueprint $table) {
            // SQLite doesn't support modifying enum, so we'll drop and recreate
            $table->dropColumn('status');
        });

        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected', 'needs_revision'])
                  ->default('pending')
                  ->after('dpl_id');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->after('status');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['status', 'reviewed_by', 'reviewed_at']);
        });

        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->enum('status', ['registered', 'approved', 'rejected'])->default('registered');
        });
    }
};
