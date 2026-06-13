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
        // Sync existing registrations with their posto assignment
        \Illuminate\Support\Facades\DB::table('kkn_posto_members')
            ->orderBy('id')
            ->chunk(100, function ($members) {
                foreach ($members as $member) {
                    \Illuminate\Support\Facades\DB::table('kkn_registrations')
                        ->where('student_id', $member->student_id)
                        ->where('status', 'approved')
                        ->update(['kkn_posto_id' => $member->kkn_posto_id]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot cleanly reverse this sync
    }
};
