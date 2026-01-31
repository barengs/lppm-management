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
            // Add user_id foreign key
            $table->foreignId('user_id')->after('id')->constrained()->onDelete('cascade');
            
            // Drop duplicate columns (data will come from users table)
            $table->dropColumn(['name', 'email', 'phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_members', function (Blueprint $table) {
            // Restore columns
            $table->string('name')->after('id');
            $table->string('email')->nullable()->after('position');
            $table->string('phone')->nullable()->after('email');
            
            // Drop foreign key
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
