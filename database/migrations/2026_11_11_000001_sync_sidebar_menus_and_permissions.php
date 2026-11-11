<?php

use App\Support\MenuPermissionCatalog;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        MenuPermissionCatalog::syncPermissions(true);
        MenuPermissionCatalog::syncSidebarMenu();
    }

    public function down(): void
    {
        // Sync migration is additive/idempotent; intentionally no destructive rollback.
    }
};

