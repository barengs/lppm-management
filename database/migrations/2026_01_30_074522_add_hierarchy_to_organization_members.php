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
        Schema::table('organization_members', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('id')->constrained('organization_members')->onDelete('cascade');
            $table->string('email')->nullable()->after('position');
            $table->string('phone')->nullable()->after('email');
            $table->integer('level')->default(0)->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_members', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'email', 'phone', 'level']);
        });
    }
};
