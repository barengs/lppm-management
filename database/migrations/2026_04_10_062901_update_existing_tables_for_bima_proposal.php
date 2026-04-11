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
        Schema::table('proposals', function (Blueprint $table) {
            $table->integer('current_step')->default(0)->after('status');
            $table->integer('tkt_level')->nullable()->after('current_step');
            $table->decimal('tkt_score', 8, 2)->nullable()->after('tkt_level');
            $table->string('rejection_reason')->nullable()->after('status');
        });

        Schema::table('system_settings', function (Blueprint $table) {
            $table->string('university_cluster')->default('Binaan')->after('university_name');
        });

        Schema::table('schemes', function (Blueprint $table) {
            $table->json('eligible_clusters')->nullable()->after('type'); // ['Mandiri', 'Utama', etc.]
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schemes', function (Blueprint $table) {
            $table->dropColumn('eligible_clusters');
        });

        Schema::table('system_settings', function (Blueprint $table) {
            $table->dropColumn('university_cluster');
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn(['current_step', 'tkt_level', 'tkt_score', 'rejection_reason']);
        });
    }
};
