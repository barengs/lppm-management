<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('proposals', 'deleted_at')) {
            Schema::table('proposals', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        // Add Spatie permission for managing research proposal trash
        $permission = Permission::firstOrCreate(['name' => 'manage_proposal_trash', 'guard_name' => 'api']);
        
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($permission);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $permission = Permission::where('name', 'manage_proposal_trash')->first();

        if ($adminRole && $permission) {
            $adminRole->revokePermissionTo($permission);
        }

        if ($permission) {
            $permission->delete();
        }

        Schema::table('proposals', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
