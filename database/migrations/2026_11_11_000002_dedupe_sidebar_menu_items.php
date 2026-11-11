<?php

use App\Support\MenuPermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        MenuPermissionCatalog::syncSidebarMenu();
        MenuPermissionCatalog::syncPermissions(true);
    }

    public function down(): void
    {
        // Additive/dedup cleanup migration.
    }
};

