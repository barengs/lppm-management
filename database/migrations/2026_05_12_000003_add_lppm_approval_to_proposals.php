<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->enum('lppm_approval_status', ['pending', 'approved', 'rejected'])->default('pending')->after('status');
            $table->timestamp('lppm_approval_date')->nullable()->after('lppm_approval_status');
            $table->text('lppm_approval_note')->nullable()->after('lppm_approval_date');
        });

        Schema::table('pkm_proposals', function (Blueprint $table) {
            $table->enum('lppm_approval_status', ['pending', 'approved', 'rejected'])->default('pending')->after('status');
            $table->timestamp('lppm_approval_date')->nullable()->after('lppm_approval_status');
            $table->text('lppm_approval_note')->nullable()->after('lppm_approval_date');
        });
    }

    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn(['lppm_approval_status', 'lppm_approval_date', 'lppm_approval_note']);
        });

        Schema::table('pkm_proposals', function (Blueprint $table) {
            $table->dropColumn(['lppm_approval_status', 'lppm_approval_date', 'lppm_approval_note']);
        });
    }
};
