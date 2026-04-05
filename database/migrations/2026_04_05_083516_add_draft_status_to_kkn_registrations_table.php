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
            $table->string('status')->default('draft')->change();
            $table->integer('current_step')->default(1)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->integer('status')->change(); // This is a bit unsafe if it was enum, but shifting back to standard string or what it was.
            $table->dropColumn('current_step');
        });
    }
};
