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
        Schema::table('pkm_proposals', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add permission
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $permission = \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'manage_pkm_trash', 'guard_name' => 'api']);
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        if (!$role->hasPermissionTo('manage_pkm_trash')) {
            $role->givePermissionTo('manage_pkm_trash');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove permission
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $role = \Spatie\Permission\Models\Role::where(['name' => 'admin', 'guard_name' => 'api'])->first();
        if ($role && $role->hasPermissionTo('manage_pkm_trash')) {
            $role->revokePermissionTo('manage_pkm_trash');
        }
        $permission = \Spatie\Permission\Models\Permission::where(['name' => 'manage_pkm_trash', 'guard_name' => 'api'])->first();
        if ($permission) {
            $permission->delete();
        }

        Schema::table('pkm_proposals', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
