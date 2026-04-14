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
        Schema::table('proposal_personnel', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->enum('type', ['dosen', 'mahasiswa'])->default('dosen')->after('user_id');
            $table->string('student_name')->nullable()->after('type');
            $table->string('student_nim')->nullable()->after('student_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposal_personnel', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->dropColumn(['type', 'student_name', 'student_nim']);
        });
    }
};
